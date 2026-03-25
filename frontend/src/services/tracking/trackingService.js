import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { FRONTEND_TEST_MODE, TRACKING_BULK_ENDPOINT } from '../../config/api';
import {
    appendRunHistory,
    appendTrackingQueue,
    clearTrackingState,
    DEFAULT_TRACKING_STATE,
    loadAuthSession,
    loadTrackingQueue,
    loadTrackingState,
    removeQueuedPointsById,
    saveTrackingState,
} from '../../storage/appStorage';
import {
    buildPointId,
    getAverageSpeedKmh,
    getDistanceBetweenCoords,
    metersPerSecondToKmh,
} from '../../utils/runMetrics';

export const LOCATION_TASK_NAME = 'runwus-background-location-task';

const PROFILE_OPTIONS = {
    economy: {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 12000,
        distanceInterval: 15,
        deferredUpdatesDistance: 20,
        deferredUpdatesInterval: 15000,
    },
    balanced: {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 5,
        deferredUpdatesDistance: 8,
        deferredUpdatesInterval: 8000,
    },
    performance: {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2500,
        distanceInterval: 3,
        deferredUpdatesDistance: 5,
        deferredUpdatesInterval: 4000,
    },
};

const FOREGROUND_SERVICE_CONFIG = {
    notificationTitle: 'RunWus suit votre course',
    notificationBody: 'Le tracking GPS continue meme ecran verrouille.',
    notificationColor: '#22C55E',
};

let syncPromise = null;
let profilePromise = null;

function createRunId() {
    return `run_${Date.now()}`;
}

function getProfileNameForSpeed(speedKmh) {
    if (speedKmh >= 13) {
        return 'performance';
    }

    if (speedKmh >= 5) {
        return 'balanced';
    }

    return 'economy';
}

function getLocationTaskOptions(profileName) {
    const profile = PROFILE_OPTIONS[profileName] ?? PROFILE_OPTIONS.balanced;

    return {
        ...profile,
        activityType: Location.ActivityType.Fitness,
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        foregroundService: FOREGROUND_SERVICE_CONFIG,
    };
}

function createLocationPoint(location, trackingState) {
    const timestamp = new Date(location.timestamp ?? Date.now()).toISOString();
    const speed = Number((location.coords.speed ?? 0).toFixed(2));

    return {
        id: buildPointId(
            trackingState.runId,
            timestamp,
            location.coords.latitude,
            location.coords.longitude
        ),
        runId: trackingState.runId,
        userId: trackingState.userId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp,
        speed,
        speedKmh: Number(metersPerSecondToKmh(speed).toFixed(2)),
        accuracy: location.coords.accuracy ?? null,
        heading: location.coords.heading ?? null,
        altitude: location.coords.altitude ?? null,
    };
}

function mergePointsIntoState(currentState, points, queueLength) {
    let nextDistanceMeters = currentState.distanceMeters ?? 0;
    let nextLastPoint = currentState.lastPoint ?? null;
    let nextRoute = [...(currentState.routeCoordinates ?? [])];

    points.forEach((point) => {
        const previousCoordinate = nextLastPoint
            ? {
                  latitude: nextLastPoint.latitude,
                  longitude: nextLastPoint.longitude,
              }
            : null;

        const currentCoordinate = {
            latitude: point.latitude,
            longitude: point.longitude,
        };

        if (previousCoordinate) {
            nextDistanceMeters += getDistanceBetweenCoords(
                previousCoordinate,
                currentCoordinate
            );
        }

        nextLastPoint = point;
        nextRoute.push(currentCoordinate);
    });

    if (nextRoute.length > 2000) {
        nextRoute = nextRoute.slice(-2000);
    }

    const durationSeconds = currentState.startedAt
        ? Math.max(
              0,
              Math.floor(
                  (new Date(nextLastPoint?.timestamp ?? Date.now()).getTime() -
                      new Date(currentState.startedAt).getTime()) /
                      1000
              )
          )
        : 0;

    return {
        ...currentState,
        lastPoint: nextLastPoint,
        routeCoordinates: nextRoute,
        distanceMeters: Number(nextDistanceMeters.toFixed(2)),
        durationSeconds,
        currentSpeedKmh: Number((nextLastPoint?.speedKmh ?? 0).toFixed(2)),
        averageSpeedKmh: Number(
            getAverageSpeedKmh(nextDistanceMeters, durationSeconds).toFixed(2)
        ),
        pendingSyncCount: queueLength,
        lastSyncError: currentState.lastSyncError ?? null,
    };
}

async function updateTrackingState(partialState) {
    const currentState = await loadTrackingState();
    const nextState = { ...currentState, ...partialState };
    await saveTrackingState(nextState);
    return nextState;
}

async function ensurePermissions() {
    const isLocationEnabled = await Location.hasServicesEnabledAsync();

    if (!isLocationEnabled) {
        throw new Error('Activez les services de localisation du telephone.');
    }

    const foreground = await Location.requestForegroundPermissionsAsync();

    if (foreground.status !== 'granted') {
        throw new Error('La permission de localisation au premier plan est requise.');
    }

    const background = await Location.requestBackgroundPermissionsAsync();

    if (background.status !== 'granted') {
        throw new Error(
            'La permission de localisation en arriere-plan est requise.'
        );
    }
}

async function maybeUpdateTrackingProfile(trackingState) {
    if (!trackingState?.isTracking) {
        return trackingState;
    }

    const nextProfile = getProfileNameForSpeed(trackingState.currentSpeedKmh);

    if (trackingState.activeProfile === nextProfile || profilePromise) {
        return trackingState;
    }

    profilePromise = (async () => {
        const isActive = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TASK_NAME
        );

        if (!isActive) {
            return trackingState;
        }

        await Location.startLocationUpdatesAsync(
            LOCATION_TASK_NAME,
            getLocationTaskOptions(nextProfile)
        );

        return updateTrackingState({ activeProfile: nextProfile });
    })();

    try {
        return await profilePromise;
    } finally {
        profilePromise = null;
    }
}

async function processLocationBatch(locations) {
    const currentState = await loadTrackingState();

    if (!currentState.isTracking || !currentState.runId || !currentState.userId) {
        return currentState;
    }

    const points = locations.map((location) =>
        createLocationPoint(location, currentState)
    );
    const nextQueue = await appendTrackingQueue(points);
    const nextState = mergePointsIntoState(
        currentState,
        points,
        nextQueue.length
    );

    await saveTrackingState(nextState);
    await maybeUpdateTrackingProfile(nextState);

    try {
        await flushQueuedLocations();
    } catch (error) {
        await updateTrackingState({
            pendingSyncCount: nextQueue.length,
            lastSyncError: error.message,
        });
    }

    return nextState;
}

async function getNetworkState() {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable !== false;
}

export async function flushQueuedLocations(sessionOverride = null) {
    if (syncPromise) {
        return syncPromise;
    }

    syncPromise = (async () => {
        const queue = await loadTrackingQueue();

        if (!queue.length) {
            await updateTrackingState({
                pendingSyncCount: 0,
                lastSyncError: null,
            });
            return { sent: 0 };
        }

        if (FRONTEND_TEST_MODE) {
            // Mode front-end: on vide la file localement pour simuler une synchro reussie
            // et garder une UI propre pendant les tests.
            const remainingQueue = await removeQueuedPointsById(queue.map((point) => point.id));

            await updateTrackingState({
                pendingSyncCount: remainingQueue.length,
                lastSyncAt: new Date().toISOString(),
                lastSyncError: null,
            });

            return { sent: queue.length, mocked: true };
        }

        const isOnline = await getNetworkState();

        if (!isOnline) {
            await updateTrackingState({
                pendingSyncCount: queue.length,
                lastSyncError: 'Hors ligne: les points restent en attente.',
            });
            return { sent: 0, offline: true };
        }

        const session = sessionOverride ?? (await loadAuthSession());

        if (!session?.token) {
            await updateTrackingState({
                pendingSyncCount: queue.length,
                lastSyncError: 'Aucun JWT disponible pour synchroniser.',
            });
            return { sent: 0, skipped: true };
        }

        const payload = {
            points: queue.map(
                ({ id, runId, userId, latitude, longitude, timestamp, speed, speedKmh }) => ({
                    id,
                    runId,
                    userId,
                    latitude,
                    longitude,
                    timestamp,
                    speed,
                    speedKmh,
                })
            ),
        };

        const response = await fetch(TRACKING_BULK_ENDPOINT, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${session.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(
                data?.message ??
                    'Synchronisation impossible avec le back-end NestJS.'
            );
        }

        const remainingQueue = await removeQueuedPointsById(queue.map((point) => point.id));

        await updateTrackingState({
            pendingSyncCount: remainingQueue.length,
            lastSyncAt: new Date().toISOString(),
            lastSyncError: null,
        });

        return { sent: queue.length, data };
    })();

    try {
        return await syncPromise;
    } catch (error) {
        const queue = await loadTrackingQueue();
        await updateTrackingState({
            pendingSyncCount: queue.length,
            lastSyncError: error.message,
        });
        throw error;
    } finally {
        syncPromise = null;
    }
}

export async function getTrackingSnapshot() {
    const [trackingState, queue] = await Promise.all([
        loadTrackingState(),
        loadTrackingQueue(),
    ]);

    return {
        ...DEFAULT_TRACKING_STATE,
        ...trackingState,
        pendingSyncCount: queue.length,
    };
}

export async function startRunTracking(session) {
    if (!session?.token || !session?.userId) {
        throw new Error(
            'Le tracking a besoin d une session authentifiee avec JWT et userId.'
        );
    }

    await ensurePermissions();

    const alreadyStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_TASK_NAME
    );

    if (alreadyStarted) {
        return getTrackingSnapshot();
    }

    const startedAt = new Date().toISOString();
    const runId = createRunId();

    const baseState = {
        ...DEFAULT_TRACKING_STATE,
        isTracking: true,
        runId,
        userId: session.userId,
        startedAt,
        activeProfile: 'balanced',
        pendingSyncCount: 0,
    };

    await saveTrackingState(baseState);

    const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
    });

    const firstPoint = createLocationPoint(currentLocation, baseState);
    const nextQueue = await appendTrackingQueue([firstPoint]);
    const hydratedState = mergePointsIntoState(baseState, [firstPoint], nextQueue.length);

    await saveTrackingState(hydratedState);
    await Location.startLocationUpdatesAsync(
        LOCATION_TASK_NAME,
        getLocationTaskOptions(hydratedState.activeProfile)
    );

    try {
        await flushQueuedLocations(session);
    } catch (error) {
        await updateTrackingState({
            pendingSyncCount: nextQueue.length,
            lastSyncError: error.message,
        });
    }

    return getTrackingSnapshot();
}

export async function stopRunTracking(sessionOverride = null) {
    const currentState = await loadTrackingState();
    const isActive = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);

    if (isActive) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    if (!currentState.runId) {
        await clearTrackingState();
        return null;
    }

    const stoppedAt = new Date().toISOString();
    const durationSeconds = currentState.startedAt
        ? Math.max(
              currentState.durationSeconds,
              Math.floor(
                  (new Date(stoppedAt).getTime() -
                      new Date(currentState.startedAt).getTime()) /
                      1000
              )
          )
        : currentState.durationSeconds;

    const finalSummary = {
        id: currentState.runId,
        userId: currentState.userId,
        startedAt: currentState.startedAt,
        stoppedAt,
        distanceMeters: currentState.distanceMeters,
        durationSeconds,
        averageSpeedKmh: currentState.averageSpeedKmh,
        routeCoordinates: currentState.routeCoordinates,
    };

    await appendRunHistory(finalSummary);
    await clearTrackingState();

    try {
        await flushQueuedLocations(sessionOverride);
    } catch (error) {
        console.warn('Unable to flush queued points after stopping tracking', error);
    }

    return finalSummary;
}

if (!TaskManager.isTaskDefined(LOCATION_TASK_NAME)) {
    TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
        if (error) {
            const queue = await loadTrackingQueue();
            await updateTrackingState({
                pendingSyncCount: queue.length,
                lastSyncError: error.message,
            });
            return;
        }

        const locations = data?.locations ?? [];

        if (!locations.length) {
            return;
        }

        try {
            await processLocationBatch(locations);
        } catch (taskError) {
            const queue = await loadTrackingQueue();
            await updateTrackingState({
                pendingSyncCount: queue.length,
                lastSyncError: taskError.message,
            });
        }
    });
}

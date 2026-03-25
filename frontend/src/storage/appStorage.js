import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_SESSION_KEY = '@runwus/auth-session';
export const TRACKING_STATE_KEY = '@runwus/tracking-state';
export const TRACKING_QUEUE_KEY = '@runwus/tracking-queue';
export const RUN_HISTORY_KEY = '@runwus/run-history';

export const DEFAULT_TRACKING_STATE = {
    isTracking: false,
    runId: null,
    userId: null,
    startedAt: null,
    stoppedAt: null,
    lastPoint: null,
    routeCoordinates: [],
    distanceMeters: 0,
    durationSeconds: 0,
    currentSpeedKmh: 0,
    averageSpeedKmh: 0,
    activeProfile: 'balanced',
    pendingSyncCount: 0,
    lastSyncAt: null,
    lastSyncError: null,
};

async function readJson(key, fallbackValue) {
    const rawValue = await AsyncStorage.getItem(key);

    if (!rawValue) {
        return fallbackValue;
    }

    try {
        return JSON.parse(rawValue);
    } catch (error) {
        console.warn(`Invalid JSON in storage for key ${key}`, error);
        return fallbackValue;
    }
}

async function writeJson(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function loadAuthSession() {
    return readJson(AUTH_SESSION_KEY, null);
}

export async function saveAuthSession(session) {
    await writeJson(AUTH_SESSION_KEY, session);
}

export async function clearAuthSession() {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}

export async function loadTrackingState() {
    return readJson(TRACKING_STATE_KEY, DEFAULT_TRACKING_STATE);
}

export async function saveTrackingState(state) {
    await writeJson(TRACKING_STATE_KEY, state);
}

export async function clearTrackingState() {
    await AsyncStorage.removeItem(TRACKING_STATE_KEY);
}

export async function loadTrackingQueue() {
    return readJson(TRACKING_QUEUE_KEY, []);
}

export async function saveTrackingQueue(queue) {
    await writeJson(TRACKING_QUEUE_KEY, queue);
}

export async function appendTrackingQueue(points) {
    const currentQueue = await loadTrackingQueue();
    const nextQueue = [...currentQueue, ...points];
    await saveTrackingQueue(nextQueue);
    return nextQueue;
}

export async function removeQueuedPointsById(pointIds) {
    const idSet = new Set(pointIds);
    const currentQueue = await loadTrackingQueue();
    const nextQueue = currentQueue.filter((point) => !idSet.has(point.id));
    await saveTrackingQueue(nextQueue);
    return nextQueue;
}

export async function clearTrackingQueue() {
    await AsyncStorage.removeItem(TRACKING_QUEUE_KEY);
}

export async function loadRunHistory() {
    return readJson(RUN_HISTORY_KEY, []);
}

export async function appendRunHistory(runSummary) {
    const history = await loadRunHistory();
    const nextHistory = [runSummary, ...history].slice(0, 50);
    await writeJson(RUN_HISTORY_KEY, nextHistory);
    return nextHistory;
}

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Speech from 'expo-speech';
import { useAuth } from './AuthContext';
import {
    flushQueuedLocations,
    getTrackingSnapshot,
    startRunTracking,
    stopRunTracking,
} from '../services/tracking/trackingService';

const TrackingContext = createContext(null);

export function TrackingProvider({ children }) {
    const { session } = useAuth();
    const [trackingState, setTrackingState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [lastRunSummary, setLastRunSummary] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [lastVoiceMilestone, setLastVoiceMilestone] = useState(0);

    async function refreshTrackingState() {
        const snapshot = await getTrackingSnapshot();
        
        // Auto-pause logic
        if (snapshot?.isTracking && !isPaused && snapshot.currentSpeedKmh < 0.5) {
            // Potential auto-pause? Maybe too sensitive, check for 5 seconds stay
        }

        setTrackingState(snapshot);

        // Voice coaching every 1km
        if (snapshot?.isTracking && snapshot.distanceMeters >= (lastVoiceMilestone + 1000)) {
            const km = Math.floor(snapshot.distanceMeters / 1000);
            const pace = Math.floor(snapshot.avgPaceSecPerKm / 60) + " minutes " + (snapshot.avgPaceSecPerKm % 60) + " secondes";
            Speech.speak(`${km} kilomètre atteint. Allure moyenne : ${pace} par kilomètre.`);
            setLastVoiceMilestone(km * 1000);
        }

        return snapshot;
    }

    useEffect(() => {
        let isMounted = true;

        async function bootstrapTracking() {
            const snapshot = await getTrackingSnapshot();

            if (isMounted) {
                setTrackingState(snapshot);
                setIsLoading(false);
            }
        }

        bootstrapTracking();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            refreshTrackingState().catch(() => null);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const unsubscribeNetInfo = NetInfo.addEventListener(async (state) => {
            if (state.isConnected && state.isInternetReachable !== false && session) {
                try {
                    await flushQueuedLocations(session);
                } catch (error) {
                    console.warn('Unable to flush queued points on connectivity change', error);
                }

                await refreshTrackingState().catch(() => null);
            }
        });

        const appStateSubscription = AppState.addEventListener('change', async (status) => {
            if (status === 'active') {
                if (session) {
                    try {
                        await flushQueuedLocations(session);
                    } catch (error) {
                        console.warn('Unable to flush queued points when app became active', error);
                    }
                }

                await refreshTrackingState().catch(() => null);
            }
        });

        return () => {
            unsubscribeNetInfo();
            appStateSubscription.remove();
        };
    }, [session]);

    async function startTracking() {
        if (!session) {
            throw new Error('Authentifiez-vous avant de demarrer le tracking GPS.');
        }

        setIsSubmitting(true);

        try {
            const nextState = await startRunTracking(session);
            setTrackingState(nextState);
            return nextState;
        } finally {
            setIsSubmitting(false);
        }
    }

    async function stopTracking() {
        setIsSubmitting(true);

        try {
            const summary = await stopRunTracking(session);
            setLastRunSummary(summary);
            const snapshot = await getTrackingSnapshot();
            setTrackingState(snapshot);
            return summary;
        } finally {
            setIsSubmitting(false);
        }
    }

    async function syncNow() {
        if (!session) {
            throw new Error('Aucune session active pour synchroniser les points.');
        }

        setIsSubmitting(true);

        try {
            await flushQueuedLocations(session);
            return await refreshTrackingState();
        } finally {
            setIsSubmitting(false);
        }
    }

    const value = useMemo(
        () => ({
            trackingState,
            isLoading,
            isSubmitting,
            lastRunSummary,
            startTracking,
            stopTracking,
            syncNow,
            refreshTrackingState,
        }),
        [isLoading, isSubmitting, lastRunSummary, trackingState]
    );

    return (
        <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>
    );
}

export function useTracking() {
    const context = useContext(TrackingContext);

    if (!context) {
        throw new Error('useTracking must be used inside TrackingProvider');
    }

    return context;
}

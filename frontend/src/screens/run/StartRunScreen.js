import React, { useEffect, useRef } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTracking } from '../../context/TrackingContext';
import {
    formatDistance,
    formatDuration,
    getMapRegionForCoordinate,
} from '../../utils/runMetrics';

const DEFAULT_REGION = {
    latitude: 33.5731, // Casablanca default instead of Paris
    longitude: -7.5898,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
};

export default function StartRunScreen() {
    const mapRef = useRef(null);
    const { session } = useAuth();
    const {
        isLoading,
        isSubmitting,
        lastRunSummary,
        startTracking,
        stopTracking,
        syncNow,
        trackingState,
    } = useTracking();

    const route = trackingState?.routeCoordinates ?? [];
    const isRunning = trackingState?.isTracking ?? false;
    const lastCoordinate = route[route.length - 1] ?? null;

    useEffect(() => {
        // Center map on current location immediately on mount
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                if (mapRef.current && !lastCoordinate) {
                    mapRef.current.animateToRegion(getMapRegionForCoordinate(loc.coords), 1000);
                }
            } catch (e) { console.warn(e); }
        })();
    }, []);

    useEffect(() => {
        if (!lastCoordinate || !mapRef.current) {
            return;
        }

        mapRef.current.animateToRegion(
            getMapRegionForCoordinate(lastCoordinate),
            500
        );
    }, [lastCoordinate]);

    useEffect(() => {
        if (!lastRunSummary) {
            return;
        }

        Alert.alert(
            'Course enregistree',
            `Distance: ${formatDistance(lastRunSummary.distanceMeters)}\nTemps: ${formatDuration(lastRunSummary.durationSeconds)}`
        );
    }, [lastRunSummary]);

    const handleToggleRun = async () => {
        try {
            if (isRunning) {
                await stopTracking();
                return;
            }

            await startTracking();
        } catch (error) {
            Alert.alert('Tracking GPS', error.message);
        }
    };

    const handleSyncNow = async () => {
        try {
            await syncNow();
        } catch (error) {
            Alert.alert('Synchronisation', error.message);
        }
    };

    const currentRegion = getMapRegionForCoordinate(lastCoordinate) ?? DEFAULT_REGION;

    // Heatmap segments calculation
    const segments = [];
    for (let i = 0; i < route.length - 1; i++) {
        const speed = route[i].speedKmh ?? 0;
        let color = '#ff4444'; // Red (slow)
        if (speed > 8) color = '#ffbb33'; // Orange
        if (speed > 12) color = '#00C851'; // Green (fast)

        segments.push(
            <Polyline
                key={`segment-${i}`}
                coordinates={[route[i], route[i + 1]]}
                strokeColor={color}
                strokeWidth={6}
            />
        );
    }

    // Ghost calculation (simple version: moves at PR avg pace)
    const ghostPaceKmMin = 5.0; // Assume 12km/h for now, should fetch from PR
    const ghostDistance = (trackingState?.durationSeconds ?? 0) * (ghostPaceKmMin / 3600) * 1000;

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={DEFAULT_REGION}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {segments}

                {lastCoordinate && (
                    <Marker coordinate={lastCoordinate} title="Vous">
                        <View style={styles.userMarker} />
                    </Marker>
                )}

                {isRunning && (
                    <Marker coordinate={route[0]} title="Ghost (PR)">
                        <View style={styles.ghostMarker}>
                            <Ionicons name="flash" size={16} color="#757575" />
                        </View>
                    </Marker>
                )}
            </MapView>

            <BlurView intensity={90} tint="dark" style={styles.topStats}>
                <View style={styles.glassRow}>
                    <View style={styles.glassBlock}>
                        <Text style={styles.glassLabel}>ALLURE</Text>
                        <Text style={styles.glassValue}>{formatDuration(trackingState?.currentPaceSecPerKm ?? 0)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.glassBlock}>
                        <Text style={styles.glassLabel}>DISTANCE</Text>
                        <Text style={styles.glassValue}>{formatDistance(trackingState?.distanceMeters ?? 0)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.glassBlock}>
                        <Text style={styles.glassLabel}>KCAL</Text>
                        <Text style={styles.glassValue}>
                            {((1.036 * 75 * (trackingState?.distanceMeters ?? 0)) / 1000).toFixed(0)}
                        </Text>
                    </View>
                </View>
            </BlurView>

            <View style={styles.controlPanel}>
                <BlurView intensity={90} tint="dark" style={styles.controlBlur}>
                    <ScrollView contentContainerStyle={styles.controlContent}>
                        <View style={styles.panelHeader}>
                            <Text style={styles.panelTitle}>Session active</Text>
                            {isRunning && (
                                <View style={styles.liveIndicator}>
                                    <View style={styles.pulseDot} />
                                    <Text style={styles.liveText}>LIVE</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statBlock}>
                                <Text style={styles.statLabel}>Temps</Text>
                                <Text style={styles.statValue}>
                                    {formatDuration(trackingState?.durationSeconds ?? 0)}
                                </Text>
                            </View>
                            <View style={styles.statBlock}>
                                <Text style={styles.statLabel}>Vitesse</Text>
                                <Text style={styles.statValue}>
                                    {(trackingState?.currentSpeedKmh ?? 0).toFixed(1)} km/h
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, isRunning ? styles.stopButton : styles.startButton]}
                            onPress={handleToggleRun}
                            disabled={isSubmitting || isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isRunning ? 'Stopper la course' : 'Demarrer la course'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={handleSyncNow}
                            disabled={isSubmitting || isLoading}
                        >
                            <Text style={styles.buttonText}>Forcer la synchronisation</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </BlurView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    map: { flex: 1 },
    controlPanel: {
        position: 'absolute',
        bottom: spacing.large,
        left: spacing.large,
        right: spacing.large,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        maxHeight: '45%',
    },
    controlBlur: { flex: 1 },
    controlContent: { padding: spacing.large },
    topStats: {
        position: 'absolute',
        top: 50,
        left: spacing.large,
        right: spacing.large,
        borderRadius: 20,
        overflow: 'hidden',
        padding: spacing.medium,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glassRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
    glassBlock: { alignItems: 'center' },
    glassLabel: { color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    glassValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
    divider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
    panelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.medium },
    panelTitle: { ...typography.heading, color: colors.text },
    liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,68,68,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ff4444', marginRight: 6 },
    liveText: { color: '#ff4444', fontSize: 10, fontWeight: '900' },
    userMarker: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, borderWidth: 3, borderColor: '#fff' },
    ghostMarker: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
    statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: spacing.medium },
    statBlock: { alignItems: 'center', width: '45%' },
    statLabel: { color: colors.muted, fontSize: 14 },
    statValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
    statusCard: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: spacing.medium,
        marginBottom: spacing.medium,
    },
    statusText: { color: colors.text, marginBottom: 6 },
    errorText: { color: colors.danger, marginTop: 4 },
    button: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, width: '100%' },
    startButton: { backgroundColor: colors.primary },
    stopButton: { backgroundColor: colors.danger },
    secondaryButton: { backgroundColor: colors.card, marginTop: spacing.medium },
    buttonText: { color: colors.text, fontWeight: '700', fontSize: 16, textAlign: 'center' },
    helperText: { color: colors.muted, marginTop: spacing.medium, textAlign: 'center' },
});

import React, { useEffect, useRef } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTracking } from '../../context/TrackingContext';
import {
    formatDistance,
    formatDuration,
    getMapRegionForCoordinate,
} from '../../utils/runMetrics';

const DEFAULT_REGION = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
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

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={currentRegion}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                <Polyline coordinates={route} strokeColor={colors.primary} strokeWidth={4} />
            </MapView>

            <View style={styles.controlPanel}>
                <ScrollView contentContainerStyle={styles.controlContent}>
                    <Text style={styles.panelTitle}>Tracking de course</Text>
                    <Text style={styles.panelSubtitle}>
                        Utilisateur: {session?.email ?? 'non connecte'}
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statBlock}>
                            <Text style={styles.statLabel}>Distance</Text>
                            <Text style={styles.statValue}>
                                {formatDistance(trackingState?.distanceMeters ?? 0)}
                            </Text>
                        </View>
                        <View style={styles.statBlock}>
                            <Text style={styles.statLabel}>Temps</Text>
                            <Text style={styles.statValue}>
                                {formatDuration(trackingState?.durationSeconds ?? 0)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.statBlock}>
                            <Text style={styles.statLabel}>Vitesse</Text>
                            <Text style={styles.statValue}>
                                {(trackingState?.currentSpeedKmh ?? 0).toFixed(1)} km/h
                            </Text>
                        </View>
                        <View style={styles.statBlock}>
                            <Text style={styles.statLabel}>Profil batterie</Text>
                            <Text style={styles.statValue}>
                                {trackingState?.activeProfile ?? 'balanced'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.statusCard}>
                        <Text style={styles.statusText}>
                            Etat: {isRunning ? 'tracking actif meme ecran verrouille' : 'pret'}
                        </Text>
                        <Text style={styles.statusText}>
                            Points en attente: {trackingState?.pendingSyncCount ?? 0}
                        </Text>
                        <Text style={styles.statusText}>
                            Derniere sync: {trackingState?.lastSyncAt ?? 'aucune'}
                        </Text>
                        {trackingState?.lastSyncError ? (
                            <Text style={styles.errorText}>{trackingState.lastSyncError}</Text>
                        ) : null}
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

                    <Text style={styles.helperText}>
                        Necessite un build de developpement ou une app standalone pour le vrai
                        background location.
                    </Text>
                </ScrollView>
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
        backgroundColor: colors.surface,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
        maxHeight: '55%',
    },
    controlContent: { padding: spacing.large },
    panelTitle: { ...typography.heading, color: colors.text, marginBottom: 4 },
    panelSubtitle: { color: colors.muted, marginBottom: spacing.medium },
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

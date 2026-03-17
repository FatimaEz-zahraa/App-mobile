import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '../../theme';

const DEFAULT_REGION = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
};

export default function StartRunScreen() {
    const [isRunning, setIsRunning] = useState(false);
    const [location, setLocation] = useState(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(true);
    const [route, setRoute] = useState([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setHasLocationPermission(false);
                console.log('Permission to access location was denied');
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
        })();
    }, []);

    const toggleRun = () => {
        setIsRunning(!isRunning);
        // TODO: Start/Stop GPS tracking interval, calculate distance...
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={location ? {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                } : DEFAULT_REGION}
                showsUserLocation={true}
            >
                <Polyline coordinates={route} strokeColor="#000" strokeWidth={3} />
            </MapView>

            {!hasLocationPermission && (
                <View style={styles.loadingContainer}>
                    <Text style={{ color: '#333' }}>
                        Location permission is required for accurate positioning.
                    </Text>
                </View>
            )}

            <View style={styles.controlPanel}>
                <View style={styles.statsRow}>
                    <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>Distance</Text>
                        <Text style={styles.statValue}>0.0 km</Text>
                    </View>
                    <View style={styles.statBlock}>
                        <Text style={styles.statLabel}>Time</Text>
                        <Text style={styles.statValue}>00:00</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.button, isRunning ? styles.stopButton : styles.startButton]}
                    onPress={toggleRun}
                >
                    <Text style={styles.buttonText}>{isRunning ? 'Stop' : 'Start'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    map: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    controlPanel: {
        position: 'absolute',
        bottom: spacing.large,
        left: spacing.large,
        right: spacing.large,
        backgroundColor: colors.surface,
        padding: spacing.large,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: spacing.medium },
    statBlock: { alignItems: 'center', width: '45%' },
    statLabel: { color: colors.muted, fontSize: 14 },
    statValue: { color: colors.text, fontSize: 18, fontWeight: '700' },
    button: { paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30, width: '100%' },
    startButton: { backgroundColor: colors.primary },
    stopButton: { backgroundColor: colors.danger },
    buttonText: { color: colors.text, fontWeight: '700', fontSize: 16, textAlign: 'center' },
});

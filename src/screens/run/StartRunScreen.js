import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

export default function StartRunScreen() {
    const [isRunning, setIsRunning] = useState(false);
    const [location, setLocation] = useState(null);
    const [route, setRoute] = useState([]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
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
            {location ? (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    showsUserLocation={true}
                >
                    <Polyline coordinates={route} strokeColor="#000" strokeWidth={3} />
                </MapView>
            ) : (
                <View style={styles.loadingContainer}>
                    <Text>Chargement de la carte...</Text>
                </View>
            )}

            <View style={styles.controlPanel}>
                <Text style={styles.statText}>Distance: 0.0 km</Text>
                <Text style={styles.statText}>Temps: 00:00</Text>
                <TouchableOpacity
                    style={[styles.button, isRunning ? styles.stopButton : styles.startButton]}
                    onPress={toggleRun}
                >
                    <Text style={styles.buttonText}>{isRunning ? 'Arrêter' : 'Démarrer'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    controlPanel: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    statText: { fontSize: 18, marginBottom: 10 },
    button: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 25 },
    startButton: { backgroundColor: '#4CAF50' },
    stopButton: { backgroundColor: '#F44336' },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});

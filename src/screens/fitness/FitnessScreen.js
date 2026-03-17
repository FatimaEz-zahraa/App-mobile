import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FitnessScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Fitness</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Workout plans, routines, and progress tracking will appear here.</Text>
                <Text style={styles.value}>Stay active and reach your goals!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    label: { fontSize: 16, color: '#666', marginBottom: 10 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});

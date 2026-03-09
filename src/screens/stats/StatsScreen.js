import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vos Statistiques</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Vitesse moyenne</Text>
                <Text style={styles.value}>10.5 km/h</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Calories brûlées (Total)</Text>
                <Text style={styles.value}>1 250 kcal</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Distance totale</Text>
                <Text style={styles.value}>45.2 km</Text>
            </View>

            {/* Placeholder for Charts */}
            <View style={[styles.card, { height: 200, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#888' }}>Graphique de progression (Chart.js / Victory)</Text>
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
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    label: { fontSize: 16, color: '#666' },
    value: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 5 },
});

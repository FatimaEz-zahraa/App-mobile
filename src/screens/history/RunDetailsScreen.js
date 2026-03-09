import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function RunDetailsScreen({ route, navigation }) {
    const { runId } = route.params;

    // In a real app, fetch run details using runId

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Détails de la course #{runId}</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Date : <Text style={styles.value}>2026-03-08</Text></Text>
                <Text style={styles.label}>Distance : <Text style={styles.value}>8.5 km</Text></Text>
                <Text style={styles.label}>Durée : <Text style={styles.value}>00:45:00</Text></Text>
                <Text style={styles.label}>Vitesse Moy. : <Text style={styles.value}>11.3 km/h</Text></Text>
                <Text style={styles.label}>Calories : <Text style={styles.value}>450 kcal</Text></Text>
            </View>

            <View style={[styles.card, { height: 200, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#888' }}>Carte du parcours avec le tracé GPS</Text>
            </View>

            <Button title="Retour" onPress={() => navigation.goBack()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    card: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
    },
    label: { fontSize: 16, marginBottom: 10, color: '#555' },
    value: { fontWeight: 'bold', color: '#000' }
});

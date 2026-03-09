import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const mockRuns = [
    { id: '1', date: '2026-03-08', duration: '00:45:00', distance: '8.5' },
    { id: '2', date: '2026-03-05', duration: '00:30:00', distance: '5.2' },
    { id: '3', date: '2026-03-01', duration: '01:05:00', distance: '12.0' },
];

export default function HistoryScreen({ navigation }) {
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RunDetails', { runId: item.id })}
        >
            <Text style={styles.date}>{item.date}</Text>
            <View style={styles.detailsRow}>
                <Text>Distance: {item.distance} km</Text>
                <Text>Temps: {item.duration}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={mockRuns}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
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
    date: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between' }
});

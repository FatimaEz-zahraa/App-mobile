import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function RunDetailsScreen({ route, navigation }) {
    const { runId } = route.params;

    // In a real app, fetch run details using runId

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Run Details #{runId}</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Date : <Text style={styles.value}>2026-03-08</Text></Text>
                <Text style={styles.label}>Distance : <Text style={styles.value}>8.5 km</Text></Text>
                <Text style={styles.label}>Durée : <Text style={styles.value}>00:45:00</Text></Text>
                <Text style={styles.label}>Vitesse Moy. : <Text style={styles.value}>11.3 km/h</Text></Text>
                <Text style={styles.label}>Calories : <Text style={styles.value}>450 kcal</Text></Text>
            </View>

            <View style={[styles.card, { height: 200, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#888' }}>Route map with GPS trace</Text>
            </View>

            <Button title="Back" onPress={() => navigation.goBack()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.large, backgroundColor: colors.background },
    title: { ...typography.heading, color: colors.text, marginBottom: spacing.large, textAlign: 'center' },
    card: {
        backgroundColor: colors.surface,
        padding: spacing.large,
        borderRadius: 16,
        marginBottom: spacing.large,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    label: { ...typography.body, marginBottom: 10, color: colors.muted },
    value: { ...typography.subtitle, fontWeight: '700', color: colors.text },
});

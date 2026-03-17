import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function StatsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Statistics</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Average speed</Text>
                <Text style={styles.value}>10.5 km/h</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Calories burned (Total)</Text>
                <Text style={styles.value}>1 250 kcal</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Total distance</Text>
                <Text style={styles.value}>45.2 km</Text>
            </View>

            {/* Placeholder for Charts */}
            <View style={[styles.card, { height: 200, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#888' }}>Progress chart (Chart.js / Victory)</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.large, backgroundColor: colors.background },
    title: { ...typography.heading, color: colors.text, marginBottom: spacing.large },
    card: {
        backgroundColor: colors.surface,
        padding: spacing.large,
        borderRadius: 16,
        marginBottom: spacing.large,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    label: { ...typography.body, color: colors.muted },
    value: { ...typography.subtitle, color: colors.text, marginTop: 8 },
});

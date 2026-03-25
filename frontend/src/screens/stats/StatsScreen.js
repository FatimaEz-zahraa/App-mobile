import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { loadRunHistory } from '../../storage/appStorage';

export default function StatsScreen() {
    const [stats, setStats] = useState({
        averageSpeedKmh: 0,
        totalCalories: 0,
        totalDistanceKm: 0,
    });

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            async function hydrateStats() {
                const runs = await loadRunHistory();
                const totalDistanceKm =
                    runs.reduce((sum, run) => sum + run.distanceMeters, 0) / 1000;
                const averageSpeedKmh =
                    runs.length > 0
                        ? runs.reduce((sum, run) => sum + (run.averageSpeedKmh ?? 0), 0) /
                          runs.length
                        : 0;

                if (isMounted) {
                    setStats({
                        averageSpeedKmh,
                        totalCalories: totalDistanceKm * 62,
                        totalDistanceKm,
                    });
                }
            }

            hydrateStats();

            return () => {
                isMounted = false;
            };
        }, [])
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Statistics</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Average speed</Text>
                <Text style={styles.value}>{stats.averageSpeedKmh.toFixed(1)} km/h</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Calories burned (Total)</Text>
                <Text style={styles.value}>{stats.totalCalories.toFixed(0)} kcal</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.label}>Total distance</Text>
                <Text style={styles.value}>{stats.totalDistanceKm.toFixed(2)} km</Text>
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

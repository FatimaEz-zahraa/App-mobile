import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, typography } from '../../theme';
import { loadRunHistory } from '../../storage/appStorage';

export default function StatsScreen() {
    const [history, setHistory] = useState([]);
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
                    runs.reduce((sum, run) => sum + (run.distanceMeters ?? 0), 0) / 1000;
                const averageSpeedKmh =
                    runs.length > 0
                        ? runs.reduce((sum, run) => sum + (run.averageSpeedKmh ?? 0), 0) /
                          runs.length
                        : 0;

                if (isMounted) {
                    setHistory(runs.slice(-6).reverse()); // Last 6 runs
                    setStats({
                        averageSpeedKmh,
                        totalCalories: totalDistanceKm * 75 * 1.036,
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

    const chartData = {
        labels: history.length > 0 ? history.map(r => new Date(r.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })) : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
        datasets: [{
            data: history.length > 0 ? history.map(r => (r.distanceMeters / 1000).toFixed(1)) : [0, 0, 0, 0, 0, 0]
        }]
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Statistiques</Text>

            <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Progression (km)</Text>
                <LineChart
                    data={chartData}
                    width={Dimensions.get('window').width - spacing.large * 2}
                    height={220}
                    chartConfig={{
                        backgroundColor: colors.surface,
                        backgroundGradientFrom: colors.surface,
                        backgroundGradientTo: colors.surface,
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(163, 163, 163, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: "5", strokeWidth: "2", stroke: colors.primary }
                    }}
                    bezier
                    style={{ marginVertical: 8, borderRadius: 16 }}
                />
            </View>

            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Vitesse moy.</Text>
                    <Text style={styles.statValue}>{stats.averageSpeedKmh.toFixed(1)} km/h</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Calories tot.</Text>
                    <Text style={styles.statValue}>{stats.totalCalories.toFixed(0)} kcal</Text>
                </View>
            </View>

            <View style={styles.statCardFull}>
                <Text style={styles.statLabel}>Distance totale parcourue</Text>
                <Text style={styles.statValueFull}>{stats.totalDistanceKm.toFixed(2)} km</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.large, backgroundColor: colors.background },
    title: { ...typography.heading, color: colors.text, marginBottom: spacing.large },
    chartContainer: { backgroundColor: colors.surface, borderRadius: 24, padding: spacing.medium, marginBottom: spacing.large },
    chartTitle: { color: colors.muted, fontWeight: '700', marginBottom: 10, marginLeft: 10 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.large },
    statCard: { backgroundColor: colors.surface, padding: spacing.large, borderRadius: 24, width: '48%', elevation: 4 },
    statCardFull: { backgroundColor: colors.surface, padding: spacing.large, borderRadius: 24, elevation: 4, marginBottom: spacing.large },
    statLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
    statValue: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 10 },
    statValueFull: { color: colors.primary, fontSize: 28, fontWeight: '900', marginTop: 10 },
});

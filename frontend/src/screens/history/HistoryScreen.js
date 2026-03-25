import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../../theme';
import { loadRunHistory } from '../../storage/appStorage';
import { formatDuration, metersToKilometers } from '../../utils/runMetrics';

export default function HistoryScreen({ navigation }) {
    const [runs, setRuns] = useState([]);

    useFocusEffect(
        useCallback(() => {
            let isMounted = true;

            async function loadRuns() {
                const history = await loadRunHistory();

                if (isMounted) {
                    setRuns(history);
                }
            }

            loadRuns();

            return () => {
                isMounted = false;
            };
        }, [])
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RunDetails', { runId: item.id })}
        >
            <Text style={styles.date}>
                {new Date(item.startedAt).toLocaleString()}
            </Text>
            <View style={styles.detailsRow}>
                <Text style={styles.detailText}>
                    Distance: {metersToKilometers(item.distanceMeters).toFixed(2)} km
                </Text>
                <Text style={styles.detailText}>
                    Temps: {formatDuration(item.durationSeconds)}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={runs}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        Aucune course locale pour le moment.
                    </Text>
                }
                contentContainerStyle={{ padding: 20 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    card: {
        backgroundColor: colors.surface,
        padding: spacing.large,
        borderRadius: 16,
        marginBottom: spacing.medium,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    date: { ...typography.subtitle, color: colors.text, marginBottom: 10 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailText: { color: colors.text },
    emptyText: { color: colors.muted, textAlign: 'center', marginTop: 40 },
});

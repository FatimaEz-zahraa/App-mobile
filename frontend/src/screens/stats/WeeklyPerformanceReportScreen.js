import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../../theme';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

export default function WeeklyPerformanceReportScreen() {
  const { session } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        const res = await fetch(`${API_URL}/goals/weekly-report`, {
          headers: { Authorization: `Bearer ${session?.token}` }
        });
        const data = await res.json();
        setReport(data);
      } catch(e) {
        console.warn(e);
      }
      setLoading(false);
    }
    loadReport();
  }, [session]);

  if (loading) {
    return <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Report</Text>
        <Text style={styles.headerSubtitle}>Meaningful Progress Overview</Text>
      </View>

      {report ? (
        <>
          <View style={styles.summaryCard}>
            <MaterialIcons name="insights" size={32} color={colors.primary} />
            <Text style={styles.summaryText}>{report.summary}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.statBox}>
              <FontAwesome5 name="fire-alt" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{report.streakDays}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialIcons name="trending-up" size={28} color={colors.primary} />
              <Text style={styles.statValue}>{report.consistencyScore}%</Text>
              <Text style={styles.statLabel}>Consistency</Text>
            </View>
          </View>

          <View style={styles.card}>
             <Text style={styles.cardTitle}>Activity Breakdown</Text>
             <Text style={styles.itemText}>Completed Workouts: <Text style={{color: colors.primary, fontWeight: 'bold'}}>{report.completedWorkouts}</Text></Text>
             <Text style={styles.itemText}>Missed Workouts: <Text style={{color: '#FF5252', fontWeight: 'bold'}}>{report.missedWorkouts}</Text></Text>
          </View>
        </>
      ) : (
        <Text style={{color: colors.text}}>Could not load the report.</Text>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { marginBottom: 20, paddingTop: 40 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  headerSubtitle: { fontSize: 16, color: colors.muted, marginTop: 4 },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary
  },
  summaryText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    fontWeight: 'bold'
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statValue: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  statLabel: { color: colors.muted, fontSize: 14, marginTop: 4 },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 12 },
  cardTitle: { color: colors.text, fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  itemText: { color: colors.text, fontSize: 16, marginBottom: 10 }
});

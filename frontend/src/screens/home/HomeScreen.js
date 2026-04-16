import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../../theme';
import socketService from '../../services/websocket';
import { updateHealthBreakdown, setMood, updateMeals, updateWellbeing } from '../../store/slices/homeSlice';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

const REST_QUOTES = [
  "Rest is not quitting — it's recharging. 🌿",
  "Your muscles grow when you rest. Take it easy today. ☁️",
  "Even champions take days off. You've earned this. 🏆",
  "Recovery is part of the plan. Trust the process. 🌸",
  "Do nothing, guilt-free. You showed up this week. ✨",
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { session } = useAuth();
  const { healthBreakdown, meals, gymSession, wellbeing } = useSelector((state) => state.home);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [quote] = useState(() => REST_QUOTES[Math.floor(Math.random() * REST_QUOTES.length)]);
  const [energySuggestion, setEnergySuggestion] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(null);

  const now = new Date();
  const dayName = DAYS[now.getDay()];
  const dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]}`;

  useEffect(() => {
    if (!session?.token) return;

    async function loadLiveData() {
      try {
        const [calRes, recRes, streakRes] = await Promise.all([
          fetch(`${API_URL}/nutrition/calories`, { headers: { Authorization: `Bearer ${session.token}` }}),
          fetch(`${API_URL}/nutrition/meals/recommendations`, { headers: { Authorization: `Bearer ${session.token}` }}),
          fetch(`${API_URL}/goals/weekly-report`, { headers: { Authorization: `Bearer ${session.token}` }}),
        ]);

        const [calData, recData, streakData] = await Promise.all([
          calRes.json(), recRes.json(), streakRes.json(),
        ]);

        dispatch(updateHealthBreakdown({
          caloriesBurned: 0,
          dailyCaloriesTarget: calData.dailyCalories,
          tdee: calData.tdee,
        }));

        dispatch(updateWellbeing({
          consistencyScore: streakData.consistencyScore || 0,
          streak: streakData.streakDays || 0,
        }));

        if (recData?.recommendations?.length >= 4) {
          dispatch(updateMeals({
            breakfast: { recommendation: recData.recommendations[0].suggestions[0], calories: recData.recommendations[0].calories },
            lunch:     { recommendation: recData.recommendations[1].suggestions[0], calories: recData.recommendations[1].calories },
            snacks:    { recommendation: recData.recommendations[3].suggestions[0], calories: recData.recommendations[3].calories },
            dinner:    { recommendation: recData.recommendations[2].suggestions[0], calories: recData.recommendations[2].calories },
          }));
        }

        setDataLoaded(true);
      } catch (err) {
        console.log('HomeScreen fetch error:', err);
      }
    }

    loadLiveData();

    socketService.connect();
    socketService.on('healthUpdate', (data) => dispatch(updateHealthBreakdown(data)));
    return () => socketService.disconnect();
  }, [session?.token]);

  const handleMoodSelect = (mood) => dispatch(setMood(mood));

  const handleEnergySelect = async (level) => {
    setEnergyLevel(level);
    try {
      const res = await fetch(`${API_URL}/onboarding/energy-suggestion?level=${level}`, {
        headers: { Authorization: `Bearer ${session?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEnergySuggestion(data);
      }
    } catch (e) {
      console.log('Energy fetch error', e);
    }
  };

  // ─── MAIN DASHBOARD ───────────────────────────────────────────────────────
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()} 👋</Text>
          <Text style={styles.date}>{dayName}, {dateStr}</Text>
        </View>
        <View style={styles.streakBadge}>
          <FontAwesome5 name="fire-alt" size={14} color="#E07B6A" />
          <Text style={styles.streakText}>{wellbeing.streak}d</Text>
        </View>
      </View>

      {/* Consistency mini bar */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.sectionLabel}>Weekly Consistency</Text>
          <Text style={styles.progressPct}>{wellbeing.consistencyScore}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(wellbeing.consistencyScore, 100)}%` }]} />
        </View>
      </View>

      {/* Mood */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>How are you feeling?</Text>
        <View style={styles.moodRow}>
          {[
            { key: 'terrible', icon: 'mood-bad' },
            { key: 'bad',      icon: 'sentiment-dissatisfied' },
            { key: 'ok',       icon: 'sentiment-neutral' },
            { key: 'good',     icon: 'sentiment-satisfied' },
            { key: 'great',    icon: 'mood' },
          ].map(({ key, icon }) => (
            <TouchableOpacity key={key} onPress={() => handleMoodSelect(key)} style={styles.moodBtn}>
              <MaterialIcons
                name={icon}
                size={30}
                color={wellbeing.mood === key ? colors.primary : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        {(wellbeing.mood === 'terrible' || wellbeing.mood === 'bad') && (
          <Text style={styles.moodHint}>
            Taking it easy today? A gentle walk or breathing exercise can help 🌬️
          </Text>
        )}
      </View>

      {/* Calorie target */}
      <View style={styles.statRow}>
        <View style={[styles.statCard, { flex: 1.2 }]}>
          <Text style={styles.statBig}>{healthBreakdown?.dailyCaloriesTarget ?? '—'}</Text>
          <Text style={styles.statSub}>Target kcal</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statBig}>{healthBreakdown.caloriesBurned}</Text>
          <Text style={styles.statSub}>Burned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statBig}>{healthBreakdown.waterTaken}L</Text>
          <Text style={styles.statSub}>Water</Text>
        </View>
      </View>

      {/* ── Energy check-in ── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>How's your energy? ⚡</Text>
        <View style={styles.energyRow}>
          {[
            { key: 'low',    label: 'Low',    color: '#E07B6A' },
            { key: 'medium', label: 'Normal', color: '#F5A623' },
            { key: 'high',   label: 'High',   color: colors.primary },
          ].map(({ key, label, color }) => (
            <TouchableOpacity
              key={key}
              style={[styles.energyBtn, energyLevel === key && { backgroundColor: color, borderColor: color }]}
              onPress={() => handleEnergySelect(key)}
            >
              <Text style={[styles.energyBtnText, energyLevel === key && { color: '#fff' }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {energySuggestion && (
          <View style={styles.suggestionBox}>
            <Text style={styles.suggestionTitle}>{energySuggestion.label} 👇</Text>
            <Text style={styles.suggestionItem}>🏋️ {energySuggestion.workout}</Text>
            <Text style={styles.suggestionItem}>🥗 {energySuggestion.nutrition}</Text>
            <Text style={styles.suggestionItem}>💤 {energySuggestion.recovery}</Text>
          </View>
        )}
      </View>

      {/* Today's session */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Today's Session</Text>
        {gymSession.isRestDay ? (
          <View style={styles.restInCard}>
            <Text style={styles.restEmoji}>🌿</Text>
            <Text style={styles.sessionName}>Rest Day</Text>
            <Text style={styles.restQuote}>{quote}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sessionName}>{gymSession.workoutName}</Text>
            <Text style={styles.sessionMeta}>{gymSession.duration}</Text>
          </>
        )}
      </View>

      {/* Meals */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Today's Meals</Text>
        {[
          { label: 'Breakfast', data: meals.breakfast },
          { label: 'Lunch',     data: meals.lunch },
          { label: 'Snack',     data: meals.snacks },
          { label: 'Dinner',    data: meals.dinner },
        ].map(({ label, data }) => (
          <View key={label} style={styles.mealRow}>
            <View style={styles.mealDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.mealLabel}>{label}</Text>
              <Text style={styles.mealText}>{data.recommendation}</Text>
            </View>
            <Text style={styles.mealCal}>{data.calories} kcal</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  // ─── Rest Day (inside card) ───────────────────────────────────────────────
  restInCard: { alignItems: 'center', paddingVertical: 8 },
  restEmoji: { fontSize: 36, marginBottom: 8 },
  restQuote: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22, fontStyle: 'italic', marginTop: 8 },

  // ─── Dashboard ────────────────────────────────────────────────────────────
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 20,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text },
  date:     { fontSize: 14, color: colors.muted, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3EF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: { fontSize: 13, fontWeight: '700', color: '#E07B6A', marginLeft: 4 },

  // Progress
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressPct:    { fontSize: 14, fontWeight: '700', color: colors.primary },
  progressTrack:  { height: 6, backgroundColor: colors.border, borderRadius: 3 },
  progressFill:   { height: 6, backgroundColor: colors.primary, borderRadius: 3 },

  // Generic card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },

  // Mood
  moodRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 },
  moodBtn: { padding: 6 },
  moodHint: { marginTop: 12, fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 },

  // Energy
  energyRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  energyBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  energyBtnText: { fontSize: 14, fontWeight: '700', color: colors.muted },
  suggestionBox: {
    marginTop: 14, backgroundColor: colors.background, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: colors.border,
  },
  suggestionTitle: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10 },
  suggestionItem:  { fontSize: 13, color: colors.text, lineHeight: 22 },

  // Stats
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
  },
  statBig: { fontSize: 20, fontWeight: '700', color: colors.text },
  statSub: { fontSize: 11, color: colors.muted, marginTop: 4 },

  // Session
  sessionName: { fontSize: 17, fontWeight: '600', color: colors.text },
  sessionMeta: { fontSize: 13, color: colors.muted, marginTop: 4 },
  bodyText:    { fontSize: 14, color: colors.muted },

  // Meals
  mealRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  mealDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 5, marginRight: 12,
  },
  mealLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  mealText:  { fontSize: 14, color: colors.text, marginTop: 2, lineHeight: 20 },
  mealCal:   { fontSize: 12, color: colors.muted, marginLeft: 8, marginTop: 5 },
});

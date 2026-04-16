import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, TextInput, StatusBar, Animated,
  Dimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { registerForPushNotificationsAsync } from '../../services/pushNotifications';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

const { width } = Dimensions.get('window');

// ── Step metadata ──────────────────────────────────────────────────────────
const TOTAL_STEPS = 5;

const GOALS = [
  { key: 'fat_loss',      label: 'Fat Loss',      emoji: '🔥', desc: 'Burn fat & feel lighter' },
  { key: 'muscle_gain',   label: 'Muscle Gain',   emoji: '💪', desc: 'Build strength & mass' },
  { key: 'mental_health', label: 'Mental Health', emoji: '🧠', desc: 'Reduce stress, boost mood' },
  { key: 'energy',        label: 'More Energy',   emoji: '⚡', desc: 'Feel alive every day' },
  { key: 'endurance',     label: 'Endurance',     emoji: '🏃', desc: 'Go further, last longer' },
];

const LIFESTYLES = [
  { key: 'student',           label: 'Student',            emoji: '🎓' },
  { key: 'busy_professional', label: 'Busy Professional',  emoji: '💼' },
  { key: 'active_job',        label: 'Active Job',         emoji: '🔧' },
  { key: 'night_owl',         label: 'Night Owl',          emoji: '🌙' },
  { key: 'athlete',           label: 'Athlete',            emoji: '🏅' },
];

const EQUIPMENT = [
  { key: 'gym',     label: 'Full Gym',    emoji: '🏋️' },
  { key: 'home',    label: 'Home Setup',  emoji: '🏠' },
  { key: 'minimal', label: 'Minimal',     emoji: '🎽' },
];

const WORKOUT_DAYS = [3, 4, 5, 6];

const TIMES = [
  { key: 'morning',   label: 'Morning',   emoji: '🌅' },
  { key: 'afternoon', label: 'Afternoon', emoji: '☀️' },
  { key: 'evening',   label: 'Evening',   emoji: '🌆' },
  { key: 'night',     label: 'Night',     emoji: '🌃' },
];

// ── Component ──────────────────────────────────────────────────────────────
export default function AdaptiveOnboardingScreen() {
  const navigation = useNavigation();
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const progress = useRef(new Animated.Value(1 / TOTAL_STEPS)).current;

  // Form state
  const [goals, setGoals] = useState([]);
  const [lifestyle, setLifestyle] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [gender, setGender] = useState('MALE');
  const [birthDate, setBirthDate] = useState('2000-01-01');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [workoutDays, setWorkoutDays] = useState(4);
  const [preferredTime, setPreferredTime] = useState('morning');
  const [equipment, setEquipment] = useState('gym');

  const animateProgress = (nextStep) => {
    Animated.timing(progress, {
      toValue: nextStep / TOTAL_STEPS,
      duration: 350,
      useNativeDriver: false,
    }).start();
  };

  const goNext = () => {
    const nextStep = step + 1;
    setStep(nextStep);
    animateProgress(nextStep);
  };

  const goBack = () => {
    if (step === 1) return navigation.goBack();
    const prevStep = step - 1;
    setStep(prevStep);
    animateProgress(prevStep);
  };

  const toggleGoal = (key) =>
    setGoals(prev => prev.includes(key) ? prev.filter(g => g !== key) : [...prev, key]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const body = {
        goals,
        lifestyle,
        weightKg: parseFloat(weightKg),
        heightCm: parseFloat(heightCm),
        gender,
        birthDate: new Date(birthDate).toISOString(),
        fitnessLevel,
        workoutDaysPerWeek: workoutDays,
        preferredWorkoutTime: preferredTime,
        equipmentAccess: equipment,
      };

      const res = await fetch(`${API_URL}/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await registerForPushNotificationsAsync();
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      }
    } catch (e) {
      console.error('Onboarding save failed', e);
    }
    setSaving(false);
  };

  // ── Step renderers ─────────────────────────────────────────────────────
  const Step1 = () => (
    <View>
      <Text style={styles.stepTitle}>What are your goals? 🎯</Text>
      <Text style={styles.stepSubtitle}>Pick all that matter to you.</Text>
      {GOALS.map(g => (
        <TouchableOpacity
          key={g.key}
          style={[styles.optionCard, goals.includes(g.key) && styles.optionCardActive]}
          onPress={() => toggleGoal(g.key)}
        >
          <Text style={styles.optionEmoji}>{g.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, goals.includes(g.key) && styles.optionLabelActive]}>{g.label}</Text>
            <Text style={styles.optionDesc}>{g.desc}</Text>
          </View>
          {goals.includes(g.key) && <MaterialIcons name="check-circle" size={22} color={colors.primary} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const Step2 = () => (
    <View>
      <Text style={styles.stepTitle}>Your lifestyle 🌍</Text>
      <Text style={styles.stepSubtitle}>We'll adapt your plan to your daily rhythm.</Text>
      {LIFESTYLES.map(l => (
        <TouchableOpacity
          key={l.key}
          style={[styles.optionCard, lifestyle === l.key && styles.optionCardActive]}
          onPress={() => setLifestyle(l.key)}
        >
          <Text style={styles.optionEmoji}>{l.emoji}</Text>
          <Text style={[styles.optionLabel, lifestyle === l.key && styles.optionLabelActive]}>{l.label}</Text>
          {lifestyle === l.key && <MaterialIcons name="check-circle" size={22} color={colors.primary} />}
        </TouchableOpacity>
      ))}
    </View>
  );

  const Step3 = () => (
    <View>
      <Text style={styles.stepTitle}>Your metrics 📏</Text>
      <Text style={styles.stepSubtitle}>Used to calculate your exact calorie target.</Text>

      <Text style={styles.fieldLabel}>Gender</Text>
      <View style={styles.pillRow}>
        {['MALE', 'FEMALE', 'OTHER'].map(g => (
          <TouchableOpacity
            key={g}
            style={[styles.pill, gender === g && styles.pillActive]}
            onPress={() => setGender(g)}
          >
            <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>{g}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Fitness Level</Text>
      <View style={styles.pillRow}>
        {['beginner', 'intermediate', 'advanced'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, fitnessLevel === f && styles.pillActive]}
            onPress={() => setFitnessLevel(f)}
          >
            <Text style={[styles.pillText, fitnessLevel === f && styles.pillTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.twoCol}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.fieldLabel}>Weight (kg)</Text>
          <TextInput style={styles.input} placeholder="75" keyboardType="numeric" value={weightKg} onChangeText={setWeightKg} placeholderTextColor={colors.muted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Height (cm)</Text>
          <TextInput style={styles.input} placeholder="175" keyboardType="numeric" value={heightCm} onChangeText={setHeightCm} placeholderTextColor={colors.muted} />
        </View>
      </View>

      <Text style={styles.fieldLabel}>Birth Date (YYYY-MM-DD)</Text>
      <TextInput style={styles.input} placeholder="2000-01-01" value={birthDate} onChangeText={setBirthDate} placeholderTextColor={colors.muted} />
    </View>
  );

  const Step4 = () => (
    <View>
      <Text style={styles.stepTitle}>Your schedule ⏱️</Text>
      <Text style={styles.stepSubtitle}>We'll build a weekly plan around your life.</Text>

      <Text style={styles.fieldLabel}>Workouts per week</Text>
      <View style={styles.pillRow}>
        {WORKOUT_DAYS.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.pill, workoutDays === d && styles.pillActive]}
            onPress={() => setWorkoutDays(d)}
          >
            <Text style={[styles.pillText, workoutDays === d && styles.pillTextActive]}>{d}x</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Preferred workout time</Text>
      {TIMES.map(t => (
        <TouchableOpacity
          key={t.key}
          style={[styles.optionCard, preferredTime === t.key && styles.optionCardActive]}
          onPress={() => setPreferredTime(t.key)}
        >
          <Text style={styles.optionEmoji}>{t.emoji}</Text>
          <Text style={[styles.optionLabel, preferredTime === t.key && styles.optionLabelActive]}>{t.label}</Text>
          {preferredTime === t.key && <MaterialIcons name="check-circle" size={22} color={colors.primary} />}
        </TouchableOpacity>
      ))}

      <Text style={styles.fieldLabel}>Equipment access</Text>
      <View style={styles.pillRow}>
        {EQUIPMENT.map(e => (
          <TouchableOpacity
            key={e.key}
            style={[styles.pill, { flex: 1, flexDirection: 'row', gap: 4 }, equipment === e.key && styles.pillActive]}
            onPress={() => setEquipment(e.key)}
          >
            <Text>{e.emoji}</Text>
            <Text style={[styles.pillText, equipment === e.key && styles.pillTextActive]}>{e.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const Step5 = () => (
    <View style={{ alignItems: 'center', paddingTop: 20 }}>
      <Text style={{ fontSize: 64, marginBottom: 20 }}>🎉</Text>
      <Text style={[styles.stepTitle, { textAlign: 'center' }]}>You're all set!</Text>
      <Text style={[styles.stepSubtitle, { textAlign: 'center', marginBottom: 32 }]}>
        Your personalized workout, nutrition, habit, and sleep plans are being generated based on your profile.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryRow}>🎯 <Text style={styles.summaryBold}>{goals.length}</Text> goals selected</Text>
        <Text style={styles.summaryRow}>🌍 Lifestyle: <Text style={styles.summaryBold}>{lifestyle || '—'}</Text></Text>
        <Text style={styles.summaryRow}>🏋️ Training: <Text style={styles.summaryBold}>{workoutDays}x / week · {preferredTime}</Text></Text>
        <Text style={styles.summaryRow}>🏠 Equipment: <Text style={styles.summaryBold}>{equipment}</Text></Text>
      </View>

      <Text style={[styles.stepSubtitle, { textAlign: 'center', marginTop: 20, fontSize: 13 }]}>
        We'll introduce new habits gradually each week — starting simple and building up. Ready?
      </Text>
    </View>
  );

  const canProceed = () => {
    if (step === 1) return goals.length > 0;
    if (step === 2) return lifestyle.length > 0;
    if (step === 3) return weightKg && heightCm && birthDate;
    return true;
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%'],
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.stepCounter}>{step} / {TOTAL_STEPS}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
        {step === 5 && <Step5 />}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.ctaBtn, !canProceed() && styles.ctaBtnDisabled]}
          onPress={step === TOTAL_STEPS ? handleFinish : goNext}
          disabled={!canProceed() || saving}
        >
          <Text style={styles.ctaBtnText}>
            {saving ? 'Building your plan…' : step === TOTAL_STEPS ? "Let's go 🚀" : 'Continue'}
          </Text>
          {!saving && <MaterialIcons name="arrow-forward" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingBottom: 12,
  },
  stepCounter: { fontSize: 13, color: colors.muted, fontWeight: '600' },

  progressTrack: { height: 4, backgroundColor: colors.border, marginHorizontal: 20, borderRadius: 2 },
  progressFill:  { height: 4, backgroundColor: colors.primary, borderRadius: 2 },

  scroll: { paddingHorizontal: 20, paddingTop: 28 },

  stepTitle:    { fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: -0.5, marginBottom: 6 },
  stepSubtitle: { fontSize: 15, color: colors.muted, marginBottom: 24, lineHeight: 22 },

  // Option cards
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 12,
  },
  optionCardActive: { borderColor: colors.primary, backgroundColor: '#F0FAF5' },
  optionEmoji:      { fontSize: 22, width: 32, textAlign: 'center' },
  optionLabel:      { fontSize: 16, fontWeight: '600', color: colors.text },
  optionLabelActive:{ color: colors.primary },
  optionDesc:       { fontSize: 12, color: colors.muted, marginTop: 2 },

  // Pills
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive:    { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText:      { fontSize: 13, fontWeight: '600', color: colors.muted },
  pillTextActive:{ color: '#fff' },

  // Inputs
  twoCol:     { flexDirection: 'row', marginBottom: 4 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
    marginBottom: 16,
  },

  // Summary
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  summaryRow:  { fontSize: 15, color: colors.text },
  summaryBold: { fontWeight: '700', color: colors.primary },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  ctaBtnDisabled: { backgroundColor: colors.border },
  ctaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

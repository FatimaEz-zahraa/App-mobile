import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config/api';

// ─── Suggestions library ───────────────────────────────────────────────────
const SUGGESTIONS = {
  'Chest': ['Bench Press', 'Incline Dumbbell Press', 'Push-ups', 'Cable Fly', 'Chest Dip'],
  'Back':  ['Pull-ups', 'Barbell Row', 'Lat Pulldown', 'Seated Cable Row', 'Deadlift'],
  'Legs':  ['Squats', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Curl', 'Calf Raise'],
  'Shoulders': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Shrugs'],
  'Arms':  ['Barbell Curl', 'Tricep Pushdown', 'Hammer Curl', 'Skullcrushers', 'Preacher Curl'],
  'Core':  ['Plank', 'Crunches', 'Leg Raises', 'Russian Twist', 'Ab Wheel'],
  'Cardio':['Jump Rope', 'Treadmill Sprint', 'Cycling', 'Rowing Machine', 'Jump Squats'],
};

const CATEGORIES = Object.keys(SUGGESTIONS);

const makeExercise = (name = '') => ({
  id: Date.now() + Math.random(),
  name,
  sets: '3',
  reps: '10',
  weightKg: '',
});

export default function CreateProgramScreen({ navigation }) {
  const { session } = useAuth();
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState([makeExercise()]);
  const [activeCategory, setActiveCategory] = useState('Chest');
  const [saving, setSaving] = useState(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const updateExercise = (id, field, value) => {
    setExercises(prev => prev.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const removeExercise = (id) => {
    if (exercises.length === 1) return; // keep at least one
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const addFromSuggestion = (name) => {
    // If last exercise has no name yet, fill it in; otherwise add new
    const last = exercises[exercises.length - 1];
    if (!last.name.trim()) {
      setExercises(prev => prev.map((ex, i) => i === prev.length - 1 ? { ...ex, name } : ex));
    } else {
      setExercises(prev => [...prev, makeExercise(name)]);
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!programName.trim()) { Alert.alert('Missing name', 'Please enter a program name.'); return; }
    const invalid = exercises.find(ex => !ex.name.trim());
    if (invalid) { Alert.alert('Missing exercise', 'All exercises must have a name.'); return; }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/workout/program`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({
          name: programName.trim(),
          exercises: exercises.map(ex => ({
            name: ex.name.trim(),
            sets: parseInt(ex.sets || 1, 10),
            reps: parseInt(ex.reps || 10, 10),
            weightKg: parseFloat(ex.weightKg) || 0,
          })),
        }),
      });

      if (res.ok) {
        Alert.alert('Saved! 🎉', 'Your program was saved successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const err = await res.json();
        Alert.alert('Error', err?.message || 'Could not save program.');
      }
    } catch (e) {
      Alert.alert('Network Error', 'Please check your connection and try again.');
    }
    setSaving(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>New Program</Text>
        <Text style={styles.pageSubtitle}>Add exercises and log sets per exercise.</Text>

        {/* Program name */}
        <Text style={styles.label}>Program Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Push Day A"
          placeholderTextColor={colors.muted}
          value={programName}
          onChangeText={setProgramName}
        />

        {/* ── Exercise Cards ── */}
        <Text style={[styles.label, { marginTop: 24 }]}>Exercises</Text>

        {exercises.map((ex, index) => (
          <View key={ex.id} style={styles.exCard}>
            {/* Card header */}
            <View style={styles.exCardHeader}>
              <Text style={styles.exIndex}>#{index + 1}</Text>
              {exercises.length > 1 && (
                <TouchableOpacity onPress={() => removeExercise(ex.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialIcons name="close" size={18} color={colors.muted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Exercise name */}
            <TextInput
              style={[styles.input, { marginBottom: 12 }]}
              placeholder="Exercise name"
              placeholderTextColor={colors.muted}
              value={ex.name}
              onChangeText={v => updateExercise(ex.id, 'name', v)}
            />

            {/* Sets / Reps / Weight row */}
            <View style={styles.metaRow}>
              <View style={styles.metaField}>
                <Text style={styles.metaLabel}>Sets</Text>
                <TextInput
                  style={styles.metaInput}
                  keyboardType="numeric"
                  value={ex.sets}
                  onChangeText={v => updateExercise(ex.id, 'sets', v)}
                />
              </View>
              <View style={styles.metaSep} />
              <View style={styles.metaField}>
                <Text style={styles.metaLabel}>Reps</Text>
                <TextInput
                  style={styles.metaInput}
                  keyboardType="numeric"
                  value={ex.reps}
                  onChangeText={v => updateExercise(ex.id, 'reps', v)}
                />
              </View>
              <View style={styles.metaSep} />
              <View style={styles.metaField}>
                <Text style={styles.metaLabel}>Weight (kg)</Text>
                <TextInput
                  style={styles.metaInput}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={colors.muted}
                  value={ex.weightKg}
                  onChangeText={v => updateExercise(ex.id, 'weightKg', v)}
                />
              </View>
            </View>
          </View>
        ))}

        {/* Add exercise manually */}
        <TouchableOpacity
          style={styles.addExBtn}
          onPress={() => setExercises(prev => [...prev, makeExercise()])}
        >
          <MaterialIcons name="add" size={20} color={colors.primary} />
          <Text style={styles.addExText}>Add exercise</Text>
        </TouchableOpacity>

        {/* ── Suggestions ── */}
        <Text style={[styles.label, { marginTop: 28 }]}>Suggestions</Text>

        {/* Category tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            >
              <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Suggestion chips */}
        <View style={styles.suggestionsRow}>
          {SUGGESTIONS[activeCategory].map(name => (
            <TouchableOpacity
              key={name}
              style={styles.sugChip}
              onPress={() => addFromSuggestion(name)}
            >
              <Text style={styles.sugChipText}>{name}</Text>
              <MaterialIcons name="add" size={14} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Program'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingTop: Platform.OS === 'ios' ? 56 : 40 },

  backBtn: { marginBottom: 16, alignSelf: 'flex-start' },
  pageTitle: { fontSize: 26, fontWeight: '700', color: colors.text, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 14, color: colors.muted, marginTop: 4, marginBottom: 24 },

  label: { fontSize: 11, fontWeight: '700', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
  },

  // Exercise card
  exCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  exIndex: { fontSize: 12, fontWeight: '700', color: colors.muted },

  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaField: { flex: 1, alignItems: 'center' },
  metaLabel: { fontSize: 10, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', marginBottom: 6 },
  metaInput: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    width: '90%',
  },
  metaSep: { width: 1, height: 36, backgroundColor: colors.border, marginHorizontal: 4 },

  // Add manually
  addExBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    gap: 6,
    marginTop: 4,
  },
  addExText: { color: colors.primary, fontWeight: '600', fontSize: 14 },

  // Category tabs
  catScroll: { marginBottom: 14 },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  catChipTextActive: { color: '#fff' },

  // Suggestion chips
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 },
  sugChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  sugChipText: { fontSize: 13, color: colors.text },

  // Save
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

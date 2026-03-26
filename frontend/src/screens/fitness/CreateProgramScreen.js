import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function CreateProgramScreen({ navigation }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [activities, setActivities] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const saveProgram = () => {
    // Implement API call to backend WorkoutModule soon
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create Fitness Program</Text>

          <Text style={styles.label}>Program Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Full Body Blast"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 30"
            placeholderTextColor={colors.muted}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Activities (comma separated)</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="e.g. Bench Press, Squats, Deadlift"
            placeholderTextColor={colors.muted}
            value={activities}
            onChangeText={setActivities}
            multiline
          />

          <View style={styles.row}>
            <View style={styles.col}>
                <Text style={styles.label}>Sets</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 3"
                  placeholderTextColor={colors.muted}
                  value={sets}
                  onChangeText={setSets}
                  keyboardType="numeric"
                />
            </View>
            <View style={styles.col}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 10"
                  placeholderTextColor={colors.muted}
                  value={reps}
                  onChangeText={setReps}
                  keyboardType="numeric"
                />
            </View>
            <View style={styles.col}>
                <Text style={styles.label}>Weight (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 50"
                  placeholderTextColor={colors.muted}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={saveProgram}>
            <Text style={styles.buttonText}>Save Program</Text>
          </TouchableOpacity>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { padding: spacing.large },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.medium },
  col: { flex: 0.3 },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.large },
  label: { ...typography.subtitle, color: colors.muted, marginTop: spacing.medium, marginBottom: spacing.small },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.medium,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  button: {
    marginTop: spacing.large,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontWeight: '700', fontSize: 16 },
});

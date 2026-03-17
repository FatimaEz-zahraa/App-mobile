import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function CreateProgramScreen({ navigation }) {
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [activities, setActivities] = useState('');

  const saveProgram = () => {
    // Backend not implemented yet; just navigate back.
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Fitness Program</Text>

      <Text style={styles.label}>Program Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Full Body Blast"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 30"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Activities (comma separated)</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="e.g. Push-ups, Squats, Plank"
        value={activities}
        onChangeText={setActivities}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={saveProgram}>
        <Text style={styles.buttonText}>Save Program</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.large, backgroundColor: colors.background },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.large },
  label: { ...typography.subtitle, color: colors.muted, marginTop: spacing.large, marginBottom: spacing.small },
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

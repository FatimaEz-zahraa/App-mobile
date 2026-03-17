import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const mockPrograms = [
  { id: '1', name: 'Full Body Blast', duration: '30 min' },
  { id: '2', name: 'Cardio Burn', duration: '45 min' },
  { id: '3', name: 'Stretch & Recover', duration: '20 min' },
];

export default function FitnessHomeScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Create', { programId: item.id })}
    >
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.subtitle}>Duration: {item.duration}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Training Programs</Text>
      <FlatList
        data={mockPrograms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('CreateProgram')}
      >
        <Text style={styles.buttonText}>Create New Program</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { ...typography.heading, color: colors.text, margin: spacing.large },
  list: { paddingHorizontal: spacing.large, paddingBottom: spacing.large },
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
  title: { ...typography.subtitle, color: colors.text, marginBottom: 4 },
  subtitle: { ...typography.body, color: colors.muted },
  button: {
    margin: spacing.large,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontWeight: '700', fontSize: 16 },
});

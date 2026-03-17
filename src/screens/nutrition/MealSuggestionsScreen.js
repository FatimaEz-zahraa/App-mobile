import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';

const mealOptions = [
  {
    id: '1',
    name: 'Grilled salmon & quinoa',
    calories: 520,
    details: 'Protein-rich meal with healthy fats and fiber.',
  },
  {
    id: '2',
    name: 'Veggie bowl with tofu',
    calories: 430,
    details: 'Balanced vegan option with carbs + protein.',
  },
  {
    id: '3',
    name: 'Chicken wrap & green salad',
    calories: 480,
    details: 'Lean protein + veggies for recovery.',
  },
];

export default function MealSuggestionsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meal Suggestions</Text>
      {mealOptions.map((meal) => (
        <View key={meal.id} style={styles.card}>
          <Text style={styles.name}>{meal.name}</Text>
          <Text style={styles.calories}>{meal.calories} kcal</Text>
          <Text style={styles.details}>{meal.details}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.large },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.large },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.large,
    marginBottom: spacing.large,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  name: { ...typography.subtitle, color: colors.text, marginBottom: spacing.small },
  calories: { ...typography.body, color: colors.muted, marginBottom: spacing.small },
  details: { ...typography.body, color: colors.text },
  button: {
    marginTop: spacing.large,
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontWeight: '700', fontSize: 16 },
});

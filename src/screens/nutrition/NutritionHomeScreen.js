import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function NutritionHomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.subtitle}>
        Get meal suggestions based on your workout calories burned.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Next meal suggestion</Text>
        <Text style={styles.cardText}>Calories burned: 450 kcal</Text>
        <Text style={styles.cardText}>Suggested meal: Grilled chicken salad</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Suggestions')}
      >
        <Text style={styles.buttonText}>View meal alternatives</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.large },
  title: { ...typography.heading, color: colors.text, marginBottom: spacing.small },
  subtitle: { ...typography.body, color: colors.muted, marginBottom: spacing.large },
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
  cardTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.small },
  cardText: { ...typography.body, color: colors.text, marginBottom: spacing.small },
  button: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: { color: colors.text, fontWeight: '700', fontSize: 16 },
});

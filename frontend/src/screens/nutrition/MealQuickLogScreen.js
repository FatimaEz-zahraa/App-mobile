import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const MOROCCAN_MEALS = [
  { name: 'Zaâlouk with Bread', calories: 350, mealType: 'LUNCH' },
  { name: 'Tajine (Beef & Prunes)', calories: 650, mealType: 'DINNER' },
  { name: 'Harira (Moroccan Soup)', calories: 400, mealType: 'DINNER' },
  { name: 'Couscous (Vegetable)', calories: 500, mealType: 'LUNCH' },
  { name: 'Moroccan Mint Tea', calories: 60, mealType: 'SNACK' }
];

export default function MealQuickLogScreen() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleQuickLog = async (meal) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/nutrition/log-quick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ name: meal.name, calories: meal.calories, mealType: meal.mealType }),
      });
      if (response.ok) {
        Alert.alert("Success", `${meal.name} logged securely.`);
      }
    } catch (err) {
      Alert.alert("Error", "Could not log meal.");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>1-Tap Meal Logger</Text>
        <Text style={styles.headerSubtitle}>Frictionless Nutrition Tracking</Text>
      </View>

      <Text style={styles.categoryTitle}>Local Dishes (Moroccan)</Text>
      {MOROCCAN_MEALS.map((meal, idx) => (
        <View key={idx} style={styles.mealCard}>
           <View style={{flex: 1}}>
             <Text style={styles.mealName}>{meal.name}</Text>
             <Text style={styles.mealCal}>{meal.calories} kcal</Text>
           </View>
           <TouchableOpacity 
               style={styles.addButton} 
               onPress={() => handleQuickLog(meal)}
               disabled={loading}
           >
             {loading ? <ActivityIndicator color="#000"/> : <MaterialIcons name="add" size={24} color="#000" />}
           </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { marginBottom: 20, paddingTop: 40 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  headerSubtitle: { fontSize: 16, color: colors.muted, marginTop: 4 },
  categoryTitle: { color: colors.primary, fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
  mealCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  mealName: { color: colors.text, fontSize: 16, fontWeight: 'bold' },
  mealCal: { color: colors.muted, fontSize: 14, marginTop: 4 },
  addButton: {
    backgroundColor: colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

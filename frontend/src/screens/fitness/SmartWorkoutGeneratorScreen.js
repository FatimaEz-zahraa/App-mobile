import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';

export default function SmartWorkoutGeneratorScreen() {
  const { session } = useAuth();
  const [energyLevel, setEnergyLevel] = useState('normal'); // low, normal, high
  const [timeAvailable, setTimeAvailable] = useState(15);
  const [loading, setLoading] = useState(false);
  const [generatedWorkout, setGeneratedWorkout] = useState(null);

  const requestSmartWorkout = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/workout/smart-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.token}`,
        },
        body: JSON.stringify({ energyLevel, durationMin: timeAvailable }),
      });
      const data = await response.json();
      setGeneratedWorkout(data);
    } catch (error) {
      Alert.alert("Error", "Could not reach workout service.");
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Intelligent Workout Builder</Text>
        <Text style={styles.headerSubtitle}>Let us adapt to how you feel.</Text>
      </View>

      {!generatedWorkout ? (
        <View style={styles.card}>
          <Text style={styles.label}>Energy Level Today</Text>
          <View style={styles.row}>
             {['low', 'normal', 'high'].map((level) => (
               <TouchableOpacity 
                   key={level} 
                   style={[styles.btnSelection, energyLevel === level && styles.btnSelectionActive]}
                   onPress={() => setEnergyLevel(level)}
               >
                 <Text style={[styles.btnText, energyLevel === level && styles.btnTextActive]}>{level.toUpperCase()}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <Text style={[styles.label, {marginTop: 20}]}>Available Time (Minutes)</Text>
          <View style={styles.row}>
             {[15, 30, 45].map((time) => (
               <TouchableOpacity 
                   key={time} 
                   style={[styles.btnSelection, timeAvailable === time && styles.btnSelectionActive]}
                   onPress={() => setTimeAvailable(time)}
               >
                 <Text style={[styles.btnText, timeAvailable === time && styles.btnTextActive]}>{time}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <TouchableOpacity style={styles.generateBtn} onPress={requestSmartWorkout}>
             <Text style={styles.generateBtnText}>{loading ? 'Generating AI Workout...' : 'Build My Recipe'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{generatedWorkout.workoutName}</Text>
          <Text style={styles.resultSubtitle}>{generatedWorkout.estimatedDuration} mins</Text>
          
          <View style={styles.exercisesList}>
             {generatedWorkout.exercises.map((ex, idx) => (
               <View key={idx} style={styles.exerciseItem}>
                 <Text style={styles.exerciseName}>{ex.name}</Text>
                 <Text style={styles.exerciseDetails}>{ex.sets} sets • {ex.durationSec}s active</Text>
               </View>
             ))}
          </View>

          <TouchableOpacity style={styles.generateBtn} onPress={() => setGeneratedWorkout(null)}>
             <Text style={styles.generateBtnText}>Reset Setup</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  header: { marginBottom: 20, paddingTop: 40 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  headerSubtitle: { fontSize: 16, color: colors.muted, marginTop: 4 },
  card: { backgroundColor: colors.surface, padding: 20, borderRadius: 12 },
  label: { color: colors.text, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  btnSelection: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  btnSelectionActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  btnText: { color: colors.text, fontWeight: 'bold' },
  btnTextActive: { color: '#000' },
  generateBtn: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  generateBtnText: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  resultCard: { backgroundColor: colors.surface, padding: 20, borderRadius: 12, marginTop: 10 },
  resultTitle: { fontSize: 22, color: colors.primary, fontWeight: 'bold' },
  resultSubtitle: { fontSize: 16, color: colors.muted, marginBottom: 20 },
  exercisesList: { marginVertical: 10 },
  exerciseItem: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: 12 },
  exerciseName: { color: colors.text, fontSize: 18, fontWeight: '600' },
  exerciseDetails: { color: colors.muted, fontSize: 14, marginTop: 4 }
});

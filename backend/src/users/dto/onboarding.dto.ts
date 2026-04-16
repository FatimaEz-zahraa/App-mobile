export class OnboardingDto {
  // Step 1 - Goals
  goals!: string[];           // ['fat_loss', 'muscle_gain', 'mental_health', 'energy', 'endurance']

  // Step 2 - Lifestyle
  lifestyle!: string;         // 'student' | 'busy_professional' | 'active_job' | 'night_owl' | 'athlete'
  sleepHours?: number;        // avg hours
  stressLevel?: number;       // 1-5

  // Step 3 - Physical metrics
  weightKg!: number;
  heightCm!: number;
  gender!: string;
  birthDate!: string;
  fitnessLevel?: string;      // 'beginner' | 'intermediate' | 'advanced'

  // Step 4 - Preferences
  workoutDaysPerWeek?: number;
  preferredWorkoutTime?: string; // 'morning' | 'afternoon' | 'evening' | 'night'
  equipmentAccess?: string;   // 'gym' | 'home' | 'minimal'
}

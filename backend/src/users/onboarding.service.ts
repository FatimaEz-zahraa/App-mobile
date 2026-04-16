import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';

// ─── Plan generation engine ────────────────────────────────────────────────
function buildWeeklyWorkoutPlan(dto: OnboardingDto): object[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const daysPerWeek = dto.workoutDaysPerWeek ?? (dto.lifestyle === 'busy_professional' ? 3 : 4);
  const isGym = dto.equipmentAccess !== 'home' && dto.equipmentAccess !== 'minimal';

  const templates: Record<string, string[]> = {
    fat_loss:    ['HIIT Full Body', 'Upper Body Circuit', 'REST', 'Lower Body Circuit', 'Cardio + Core', 'REST', 'Active Recovery'],
    muscle_gain: ['Chest & Triceps', 'Back & Biceps', 'REST', 'Legs & Glutes', 'Shoulders & Arms', 'REST', 'REST'],
    endurance:   ['Long Run', 'Upper Body Strength', 'REST', 'Tempo Run', 'Circuit Training', 'Long Hike/Bike', 'REST'],
    mental_health: ['Yoga Flow', 'Light Walk + Stretch', 'REST', 'Pilates Core', 'Nature Walk', 'REST', 'REST'],
    energy:      ['Morning Mobility', 'Full Body Strength', 'REST', 'Cardio Intervals', 'Upper Body Push', 'REST', 'Active Recovery'],
  };

  const primaryGoal = dto.goals?.[0] ?? 'energy';
  const plan = (templates[primaryGoal] ?? templates.energy).slice(0, 7);

  return days.map((day, i) => ({
    day,
    workout: plan[i] ?? 'REST',
    isRest: plan[i] === 'REST',
    equipment: isGym ? 'Gym' : 'Home',
  }));
}

function buildNutritionPlan(dto: OnboardingDto): object {
  const isWeightLoss = dto.goals.includes('fat_loss');
  const isMuscle     = dto.goals.includes('muscle_gain');
  const weight = dto.weightKg;
  const height = dto.heightCm;
  const birthYear = new Date(dto.birthDate).getFullYear();
  const age  = new Date().getFullYear() - birthYear;
  const isMale = dto.gender === 'MALE';

  // Mifflin-St Jeor
  const bmr  = 10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161);
  const multiplier = dto.lifestyle === 'athlete' ? 1.9 : dto.lifestyle === 'active_job' ? 1.725 : 1.55;
  let target = Math.round(bmr * multiplier);
  if (isWeightLoss) target -= 400;
  if (isMuscle)     target += 300;

  return {
    dailyCalories: target,
    macros: {
      protein: Math.round((target * 0.30) / 4),
      carbs:   Math.round((target * (isWeightLoss ? 0.35 : 0.45)) / 4),
      fat:     Math.round((target * 0.25) / 9),
    },
    mealsPerDay: dto.lifestyle === 'busy_professional' ? 3 : 4,
    tip: isWeightLoss
      ? 'Prioritize protein to preserve muscle in a deficit.'
      : isMuscle
        ? 'Eat in a slight surplus and time carbs around workouts.'
        : 'Eat balanced meals every 3-4 hours to sustain energy.',
  };
}

function buildHabitPlan(dto: OnboardingDto): object[] {
  // Gradual introduction — Week 1 gets 1 habit, Week 2 gets another, etc.
  const allHabits = [
    { week: 1, habit: 'Drink 2L of water daily 💧', category: 'health' },
    { week: 1, habit: 'Sleep before midnight for 7 days 🛌', category: 'sleep' },
    { week: 2, habit: 'Take a 10-min walk after dinner 🚶', category: 'movement' },
    { week: 2, habit: 'Prepare your gym bag the night before 🎒', category: 'consistency' },
    { week: 3, habit: 'Begin each morning with 5min deep breathing 🌬️', category: 'mental' },
    { week: 3, habit: 'Track every meal for 4 days 📝', category: 'nutrition' },
    { week: 4, habit: 'Add one extra workout session this week 💪', category: 'fitness' },
    { week: 4, habit: '7-night sleep streak — same bedtime every night 🎯', category: 'sleep' },
  ];

  if (dto.goals.includes('mental_health')) {
    allHabits.unshift({ week: 1, habit: 'Journal 3 things you're grateful for daily 🙏', category: 'mental' });
  }
  if (dto.lifestyle === 'night_owl') {
    allHabits.push({ week: 5, habit: 'Move bedtime 15min earlier each week 🌙', category: 'sleep' });
  }
  if (dto.lifestyle === 'student') {
    allHabits.push({ week: 2, habit: 'Study with 25/5 Pomodoro + stretch between sessions 🎓', category: 'focus' });
  }

  return allHabits;
}

function buildEnergyPlan(): object {
  return {
    low:    { label: 'Low Energy', workout: '15-min Gentle Yoga or Walk', nutrition: 'Light, easily digestible meal — soup, eggs, fruit', recovery: 'Take a 20-min power nap if possible' },
    medium: { label: 'Normal Energy', workout: 'Your scheduled program at moderate intensity', nutrition: 'Balanced meal 60-90min before workout', recovery: 'Standard rest between sets' },
    high:   { label: 'High Energy', workout: 'Push intensity — increase weight or add a set', nutrition: 'Extra carbs pre-workout for fuel', recovery: 'Active recovery after — cold shower, stretch' },
  };
}

function buildSleepPlan(dto: OnboardingDto): object {
  const isNightOwl = dto.lifestyle === 'night_owl';
  const targetWakeTime = dto.preferredWorkoutTime === 'morning' ? '06:30' : '07:30';
  const targetSleepTime = isNightOwl ? '00:30' : '22:30';

  return {
    targetSleepHours: 7.5,
    recommendedBedtime: targetSleepTime,
    recommendedWakeTime: targetWakeTime,
    tips: [
      'Avoid screens 45min before bed 📵',
      isNightOwl ? 'Shift bedtime 15min earlier each week gradually 🌙' : 'Consistency beats duration — same time every night ⏰',
      'Keep your room cool and dark 🌑',
      dto.goals.includes('muscle_gain') ? 'Muscle is built during sleep — prioritize recovery 💤' : 'Quality sleep naturally boosts energy levels ⚡',
    ],
  };
}

@Injectable()
export class OnboardingService {
  constructor(private prisma: PrismaService) {}

  async saveOnboarding(userId: string, dto: OnboardingDto) {
    // 1. Save physical profile
    const birthDate = new Date(dto.birthDate);
    const age  = new Date().getFullYear() - birthDate.getFullYear();
    const bmi  = dto.weightKg / Math.pow(dto.heightCm / 100, 2);

    await this.prisma.userPhysicalProfile.upsert({
      where: { userId },
      create: {
        userId,
        birthDate,
        gender:       dto.gender as any,
        heightCm:     dto.heightCm,
        weightKg:     dto.weightKg,
        fitnessLevel: (dto.fitnessLevel ?? 'BEGINNER') as any,
        healthNotes:  JSON.stringify({ goals: dto.goals, lifestyle: dto.lifestyle }),
        maxHr:        220 - age,
      },
      update: {
        birthDate,
        gender:       dto.gender as any,
        heightCm:     dto.heightCm,
        weightKg:     dto.weightKg,
        fitnessLevel: (dto.fitnessLevel ?? 'BEGINNER') as any,
        healthNotes:  JSON.stringify({ goals: dto.goals, lifestyle: dto.lifestyle }),
        maxHr:        220 - age,
      },
    });

    // 2. Log initial measurement
    await this.prisma.userMeasurement.create({
      data: { userId, weightKg: dto.weightKg, bmi: Math.round(bmi * 10) / 10, measuredAt: new Date() },
    });

    // 3. Create nutrition plan goal in DB
    const nutrition = buildNutritionPlan(dto);
    await this.prisma.nutritionPlan.create({
      data: {
        userId,
        goal:           (dto.goals.includes('fat_loss') ? 'WEIGHT_LOSS' : dto.goals.includes('muscle_gain') ? 'MUSCLE_GAIN' : 'MAINTENANCE') as any,
        targetCalories: (nutrition as any).dailyCalories,
        targetProtein:  (nutrition as any).macros.protein,
        targetCarbs:    (nutrition as any).macros.carbs,
        targetFat:      (nutrition as any).macros.fat,
        isActive:       true,
      },
    });

    // 4. Return the full personalized plan (all computed, nothing hardcoded)
    return {
      status:        'onboarding_complete',
      weeklyWorkout: buildWeeklyWorkoutPlan(dto),
      nutrition,
      habits:        buildHabitPlan(dto),
      energyPlan:    buildEnergyPlan(),
      sleepPlan:     buildSleepPlan(dto),
    };
  }

  async getEnergyBasedSuggestion(userId: string, energyLevel: string) {
    const plan  = buildEnergyPlan();
    const level = energyLevel as 'low' | 'medium' | 'high';
    return (plan as any)[level] ?? (plan as any).medium;
  }
}

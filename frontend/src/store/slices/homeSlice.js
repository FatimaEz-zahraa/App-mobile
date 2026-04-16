import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  healthBreakdown: {
    caloriesBurned: 0,
    steps: 0,
    waterTaken: 0,
    sleepHours: 0,
  },
  meals: {
    breakfast: { recommendation: 'Loading...', calories: 0 },
    lunch: { recommendation: 'Loading...', calories: 0 },
    snacks: { recommendation: 'Loading...', calories: 0 },
    dinner: { recommendation: 'Loading...', calories: 0 },
  },
  gymSession: {
    isRestDay: false,
    workoutName: 'Loading Session...',
    duration: '--',
  },
  wellbeing: {
    mood: null,
    energyLevel: null,
    consistencyScore: 0,
    streak: 0
  },
  loading: false,
};

const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    updateHealthBreakdown: (state, action) => {
      state.healthBreakdown = { ...state.healthBreakdown, ...action.payload };
    },
    updateGymSession: (state, action) => {
      state.gymSession = { ...state.gymSession, ...action.payload };
    },
    updateMeals: (state, action) => {
      state.meals = { ...state.meals, ...action.payload };
    },
    setMood: (state, action) => {
      state.wellbeing.mood = action.payload;
    },
    setEnergy: (state, action) => {
      state.wellbeing.energyLevel = action.payload;
    },
    updateWellbeing: (state, action) => {
      state.wellbeing = { ...state.wellbeing, ...action.payload };
    }
  },
});

export const { updateHealthBreakdown, updateGymSession, updateMeals, setMood, setEnergy, updateWellbeing } = homeSlice.actions;
export default homeSlice.reducer;

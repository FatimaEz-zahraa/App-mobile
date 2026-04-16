import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';

import NutritionHomeScreen from '../screens/nutrition/NutritionHomeScreen';
import MealSuggestionsScreen from '../screens/nutrition/MealSuggestionsScreen';
import MealQuickLogScreen from '../screens/nutrition/MealQuickLogScreen';

const Tab = createBottomTabNavigator();

export default function NutritionNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'restaurant-menu',
            Suggestions: 'lightbulb',
            QuickLog: 'bolt',
          };
          return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={NutritionHomeScreen} options={{ title: 'Nutrition' }} />
      <Tab.Screen name="QuickLog" component={MealQuickLogScreen} options={{ title: '1-Tap Log' }} />
      <Tab.Screen name="Suggestions" component={MealSuggestionsScreen} options={{ title: 'Suggestions' }} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';

import NutritionHomeScreen from '../screens/nutrition/NutritionHomeScreen';
import MealSuggestionsScreen from '../screens/nutrition/MealSuggestionsScreen';

const Tab = createBottomTabNavigator();

export default function NutritionNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'restaurant-menu',
            Suggestions: 'lightbulb',
          };
          return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={NutritionHomeScreen} options={{ title: 'Nutrition' }} />
      <Tab.Screen name="Suggestions" component={MealSuggestionsScreen} options={{ title: 'Suggestions' }} />
    </Tab.Navigator>
  );
}

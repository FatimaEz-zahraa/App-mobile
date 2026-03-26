import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme';

import FitnessHomeScreen from '../screens/fitness/FitnessHomeScreen';
import CreateProgramScreen from '../screens/fitness/CreateProgramScreen';

const Tab = createBottomTabNavigator();

export default function FitnessNavigator() {
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
            Home: 'fitness-center',
            Create: 'playlist-add',
          };
          return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FitnessHomeScreen} options={{ title: 'Programs' }} />
      <Tab.Screen name="Create" component={CreateProgramScreen} options={{ title: 'Create' }} />
    </Tab.Navigator>
  );
}

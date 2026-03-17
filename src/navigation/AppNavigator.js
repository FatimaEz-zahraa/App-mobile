import React, { useState } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import FitnessNavigator from './FitnessNavigator';
import NutritionNavigator from './NutritionNavigator';
import { colors } from '../theme';

const Drawer = createDrawerNavigator();

const AppTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
    },
};

export default function AppNavigator() {
    // In a real app, you would check if the user is authenticated from Context/Redux/AsyncStorage
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <NavigationContainer theme={AppTheme}>
            {isAuthenticated ? (
                <Drawer.Navigator
                    initialRouteName="Run"
                    screenOptions={{
                        headerStyle: { backgroundColor: colors.surface },
                        headerTintColor: colors.text,
                        drawerStyle: { backgroundColor: colors.surface },
                        drawerActiveTintColor: colors.primary,
                        drawerInactiveTintColor: colors.muted,
                    }}
                >
                    <Drawer.Screen name="Run" component={MainNavigator} />
                    <Drawer.Screen name="Fitness" component={FitnessNavigator} />
                    <Drawer.Screen name="Nutrition" component={NutritionNavigator} />
                </Drawer.Navigator>
            ) : (
                <AuthNavigator setIsAuthenticated={setIsAuthenticated} />
            )}
        </NavigationContainer>
    );
}

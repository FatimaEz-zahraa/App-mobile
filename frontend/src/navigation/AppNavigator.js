import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import FitnessNavigator from './FitnessNavigator';
import NutritionNavigator from './NutritionNavigator';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';

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
    const { isAuthenticated, isBootstrapping } = useAuth();

    if (isBootstrapping) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.background,
                }}
            >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.text, marginTop: 12 }}>
                    Chargement de la session...
                </Text>
            </View>
        );
    }

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
                <AuthNavigator />
            )}
        </NavigationContainer>
    );
}

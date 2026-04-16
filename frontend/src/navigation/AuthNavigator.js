import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdaptiveOnboardingScreen from '../screens/auth/AdaptiveOnboardingScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
                name="Onboarding"
                component={AdaptiveOnboardingScreen}
                options={{ gestureEnabled: false }} // prevent swipe-back during onboarding
            />
        </Stack.Navigator>
    );
}

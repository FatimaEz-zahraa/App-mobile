import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AuthNavigator from './AuthNavigator';
import { TrackingProvider } from '../context/TrackingContext';
import HomeScreen from '../screens/home/HomeScreen';

// Lazy load heavy navigators
const MainNavigator = React.lazy(() => import('./MainNavigator'));
const FitnessNavigator = React.lazy(() => import('./FitnessNavigator'));
const NutritionNavigator = React.lazy(() => import('./NutritionNavigator'));
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

const AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
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
        <TrackingProvider>
            <NavigationContainer theme={AppTheme}>
                {isAuthenticated ? (
                    <Drawer.Navigator
                        initialRouteName="Home"
                        screenOptions={{
                            headerStyle: { backgroundColor: colors.surface },
                            headerTintColor: colors.text,
                            drawerStyle: { backgroundColor: colors.surface },
                            drawerActiveTintColor: colors.primary,
                            drawerInactiveTintColor: colors.muted,
                        }}
                    >
                        <Drawer.Screen name="Home" component={HomeScreen} />
                        <Drawer.Screen name="Run">
                            {props => (
                                <React.Suspense fallback={<ActivityIndicator size="large" color={colors.primary} style={{flex: 1, backgroundColor: colors.background}} />}>
                                    <MainNavigator {...props} />
                                </React.Suspense>
                            )}
                        </Drawer.Screen>
                        <Drawer.Screen name="Fitness">
                            {props => (
                                <React.Suspense fallback={<ActivityIndicator size="large" color={colors.primary} style={{flex: 1, backgroundColor: colors.background}} />}>
                                    <FitnessNavigator {...props} />
                                </React.Suspense>
                            )}
                        </Drawer.Screen>
                        <Drawer.Screen name="Nutrition">
                            {props => (
                                <React.Suspense fallback={<ActivityIndicator size="large" color={colors.primary} style={{flex: 1, backgroundColor: colors.background}} />}>
                                    <NutritionNavigator {...props} />
                                </React.Suspense>
                            )}
                        </Drawer.Screen>
                    </Drawer.Navigator>
                ) : (
                    <AuthNavigator />
                )}
            </NavigationContainer>
        </TrackingProvider>
    );
}

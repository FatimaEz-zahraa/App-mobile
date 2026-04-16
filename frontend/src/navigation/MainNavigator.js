import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import StartRunScreen from '../screens/run/StartRunScreen.js';
import StatsScreen from '../screens/stats/StatsScreen';
import WeeklyPerformanceReportScreen from '../screens/stats/WeeklyPerformanceReportScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import RunDetailsScreen from '../screens/history/RunDetailsScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const HistoryStack = createNativeStackNavigator();

function HistoryNavigator() {
    return (
        <HistoryStack.Navigator
            screenOptions={{
                headerShown: false,
                headerStyle: { backgroundColor: colors.surface },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <HistoryStack.Screen name="HistoryList" component={HistoryScreen} options={{ title: 'History' }} />
            <HistoryStack.Screen name="RunDetails" component={RunDetailsScreen} options={{ title: 'Run Details' }} />
        </HistoryStack.Navigator>
    );
}

export default function MainNavigator() {
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
                        StartRun: 'directions-run',
                        Stats: 'show-chart',
                        Weekly: 'insert-chart-outlined',
                        History: 'history',
                    };
                    return <MaterialIcons name={icons[route.name]} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="StartRun" component={StartRunScreen} options={{ title: 'Run' }} />
            <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
            <Tab.Screen name="Weekly" component={WeeklyPerformanceReportScreen} options={{ title: 'Report' }} />
            <Tab.Screen name="History" component={HistoryNavigator} options={{ title: 'History' }} />
        </Tab.Navigator>
    );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import StartRunScreen from '../screens/run/StartRunScreen';
import StatsScreen from '../screens/stats/StatsScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import RunDetailsScreen from '../screens/history/RunDetailsScreen';

const Tab = createBottomTabNavigator();
const HistoryStack = createNativeStackNavigator();

function HistoryNavigator() {
    return (
        <HistoryStack.Navigator>
            <HistoryStack.Screen name="HistoryList" component={HistoryScreen} options={{ title: 'Historique' }} />
            <HistoryStack.Screen name="RunDetails" component={RunDetailsScreen} options={{ title: 'Détails de la course' }} />
        </HistoryStack.Navigator>
    );
}

export default function MainNavigator() {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>
            <Tab.Screen name="Run" component={StartRunScreen} options={{ title: 'Course' }} />
            <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Statistiques' }} />
            <Tab.Screen name="History" component={HistoryNavigator} options={{ title: 'Historique' }} />
        </Tab.Navigator>
    );
}

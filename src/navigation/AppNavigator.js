import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export default function AppNavigator() {
    // In a real app, you would check if the user is authenticated from Context/Redux/AsyncStorage
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator setIsAuthenticated={setIsAuthenticated} />}
        </NavigationContainer>
    );
}

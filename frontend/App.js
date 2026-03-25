import React from 'react';
import './src/services/tracking/trackingService';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { TrackingProvider } from './src/context/TrackingContext';

export default function App() {
  return (
    <AuthProvider>
      <TrackingProvider>
        <AppNavigator />
      </TrackingProvider>
    </AuthProvider>
  );
}

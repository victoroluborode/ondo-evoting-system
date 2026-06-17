import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import RegistrationDashboardScreen from '../screens/officer/RegistrationDashboardScreen';
import VoterDetailsScreen from '../screens/officer/VoterDetailsScreen';
import BiometricEnrollmentScreen from '../screens/officer/BiometricEnrollmentScreen';
import SetVoterPasswordScreen from '../screens/officer/SetVoterPasswordScreen';
import RegistrationSuccessScreen from '../screens/officer/RegistrationSuccessScreen';
import OfflineQueueScreen from '../screens/shared/OfflineQueueScreen';

const Stack = createNativeStackNavigator();

export default function OfficerStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '800', fontSize: 14 },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={RegistrationDashboardScreen}
        options={{ title: 'Registration Portal' }}
      />
      <Stack.Screen
        name="VoterDetails"
        component={VoterDetailsScreen}
        options={{ title: 'Step 1: Demographics' }}
      />
      <Stack.Screen
        name="Biometrics"
        component={BiometricEnrollmentScreen}
        options={{ title: 'Step 2: Biometrics' }}
      />
      <Stack.Screen
        name="SetPassword"
        component={SetVoterPasswordScreen}
        options={{ title: 'Step 3: Security' }}
      />
      <Stack.Screen
        name="Success"
        component={RegistrationSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="OfflineQueue"
        component={OfflineQueueScreen}
        options={{ title: 'Local Sync Queue' }}
      />
    </Stack.Navigator>
  );
}

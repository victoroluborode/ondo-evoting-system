import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import BiometricChoiceScreen from '../screens/voter/BiometricChoiceScreen';
import FingerprintVerificationScreen from '../screens/voter/FingerprintVerificationScreen';
import FaceVerificationScreen from '../screens/voter/FaceVerificationScreen';
import BallotScreen from '../screens/voter/BallotScreen';
import VoteReviewScreen from '../screens/voter/VoteReviewScreen';
import ReceiptScreen from '../screens/voter/ReceiptScreen';
import OfflineQueueScreen from '../screens/shared/OfflineQueueScreen';

const Stack = createNativeStackNavigator();

export default function VoterStack() {
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
        name="BiometricChoice"
        component={BiometricChoiceScreen}
        options={{ title: 'Identity Verification' }}
      />
      <Stack.Screen
        name="FingerprintVerification"
        component={FingerprintVerificationScreen}
        options={{ title: 'Fingerprint Verification' }}
      />
      <Stack.Screen
        name="FaceVerification"
        component={FaceVerificationScreen}
        options={{ title: 'Face Verification' }}
      />
      <Stack.Screen
        name="Ballot"
        component={BallotScreen}
        options={{ title: 'Official Ballot', gestureEnabled: false }}
      />
      <Stack.Screen
        name="VoteReview"
        component={VoteReviewScreen}
        options={{ title: 'Review Selection' }}
      />
      <Stack.Screen
        name="Receipt"
        component={ReceiptScreen}
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

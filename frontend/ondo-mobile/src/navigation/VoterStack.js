import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";
import VoterDashboardScreen from "../screens/voter/VoterDashboardScreen";
import BiometricChoiceScreen from "../screens/voter/BiometricChoiceScreen";
import FingerprintVerificationScreen from "../screens/voter/FingerprintVerificationScreen";
import FaceVerificationScreen from "../screens/voter/FaceVerificationScreen";
import BallotScreen from "../screens/voter/BallotScreen";
import VoteReviewScreen from "../screens/voter/VoteReviewScreen";
import ReceiptScreen from "../screens/voter/ReceiptScreen";
import OfflineVoteQueuedScreen from "../screens/voter/OfflineVoteQueuedScreen";
import {useOfflineSync} from "../hooks/useOfflineSync";

const Stack = createNativeStackNavigator();

export default function VoterStack() {
  useOfflineSync();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: "900", fontSize: 17 },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={VoterDashboardScreen}
        options={{ title: "My Dashboard" }}
      />
      <Stack.Screen
        name="BiometricChoice"
        component={BiometricChoiceScreen}
        options={{ title: "Verify Identity" }}
      />
      <Stack.Screen
        name="FingerprintVerification"
        component={FingerprintVerificationScreen}
        options={{ title: "Fingerprint Verification" }}
      />
      <Stack.Screen
        name="FaceVerification"
        component={FaceVerificationScreen}
        options={{ title: "Face Verification" }}
      />
      <Stack.Screen
        name="Ballot"
        component={BallotScreen}
        options={{
          title: "Official Ballot",
          gestureEnabled: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="VoteReview"
        component={VoteReviewScreen}
        options={{
          title: "Review Selection",
          gestureEnabled: false,
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="Receipt"
        component={ReceiptScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="OfflineVoteQueued"
        component={OfflineVoteQueuedScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

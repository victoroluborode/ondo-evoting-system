import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";
import RegistrationDashboardScreen from "../screens/officer/RegistrationDashboardScreen";
import VinCheckScreen from "../screens/officer/VinCheckScreen";
import AlreadyRegisteredScreen from "../screens/officer/AlreadyRegisteredScreen";
import ConfirmVoterDetailsScreen from "../screens/officer/ConfirmVoterDetailsScreen";
import BiometricEnrollmentScreen from "../screens/officer/BiometricEnrollmentScreen";
import SetVoterPasswordScreen from "../screens/officer/SetVoterPasswordScreen";
import RegistrationSuccessScreen from "../screens/officer/RegistrationSuccessScreen";

const Stack = createNativeStackNavigator();

export default function OfficerStack() {
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
        component={RegistrationDashboardScreen}
        options={{ title: "Registration Portal" }}
      />
      <Stack.Screen
        name="VinCheck"
        component={VinCheckScreen}
        options={{ title: "Check Voter ID" }}
      />
      <Stack.Screen
        name="AlreadyRegistered"
        component={AlreadyRegisteredScreen}
        options={{ title: "Already Registered" }}
      />
      <Stack.Screen
        name="ConfirmVoterDetails"
        component={ConfirmVoterDetailsScreen}
        options={{ title: "Confirm Details" }}
      />
      <Stack.Screen
        name="Biometrics"
        component={BiometricEnrollmentScreen}
        options={{ title: "Capture Biometrics" }}
      />
      <Stack.Screen
        name="SetPassword"
        component={SetVoterPasswordScreen}
        options={{ title: "Set Password" }}
      />
      <Stack.Screen
        name="Success"
        component={RegistrationSuccessScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

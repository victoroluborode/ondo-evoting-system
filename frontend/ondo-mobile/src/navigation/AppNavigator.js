import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { OfflineContext } from '../context/OfflineContext';
import OfflineBanner from '../components/OfflineBanner';
import { colors } from '../theme';
import VoterStack from './VoterStack';
import AdminStack from './AdminStack';
import VoterLoginScreen from '../screens/entry/VoterLoginScreen';
import VoterRegisterScreen from '../screens/entry/VoterRegisterScreen';
import AdminLoginScreen from '../screens/entry/AdminLoginScreen';
import VoterPasswordResetScreen from '../screens/entry/VoterPasswordResetScreen';
import AccessDeniedScreen from '../screens/shared/AccessDeniedScreen';
import AlreadyRegisteredScreen from '../screens/entry/AlreadyRegisteredScreen';
import ConfirmVoterDetailsScreen from '../screens/entry/ConfirmVoterDetailsScreen';
import SetVoterPasswordScreen from '../screens/entry/SetVoterPasswordScreen';
import FingerprintEnrollmentScreen from "../screens/entry/FingerprintEnrollmentScreen";
import FaceEnrollmentScreen from "../screens/entry/FaceEnrollmentScreen";
import AlreadyVotedScreen from "../screens/entry/AlreadyVotedScreen";
import RegistrationPendingScreen from "../screens/entry/RegistrationPendingScreen";
import ReceiptVerificationScreen from "../screens/entry/ReceiptVerificationScreen";


const RootStack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: { fontWeight: '900', fontSize: 17 },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

export default function AppNavigator() {
  const { userRole } = useContext(AuthContext);
  const { isOffline } = useContext(OfflineContext);

  return (
    <>
      <OfflineBanner isOffline={isOffline} />
      <NavigationContainer>
        <RootStack.Navigator screenOptions={headerOptions}>
          {userRole === null && (
            <>
              <RootStack.Screen
                name="VoterLogin"
                component={VoterLoginScreen}
                options={{ headerShown: false }}
              />
              <RootStack.Screen
                name="VoterRegister"
                component={VoterRegisterScreen}
                options={{ title: "Create Account" }}
              />
              <RootStack.Screen
                name="VoterPasswordReset"
                component={VoterPasswordResetScreen}
                options={{ title: "Reset Password" }}
              />
              <RootStack.Screen
                name="AdminLogin"
                component={AdminLoginScreen}
                options={{ title: "Admin Login" }}
              />
              <RootStack.Screen
                name="ReceiptVerification"
                component={ReceiptVerificationScreen}
                options={{ title: "Verify Receipt" }}
              />
            </>
          )}
          {userRole === "voter" && (
            <RootStack.Screen
              name="VoterFlow"
              component={VoterStack}
              options={{ headerShown: false }}
            />
          )}
          {userRole === "admin" && (
            <RootStack.Screen
              name="AdminFlow"
              component={AdminStack}
              options={{ headerShown: false }}
            />
          )}
          <RootStack.Screen
            name="AccessDenied"
            component={AccessDeniedScreen}
          />
          <RootStack.Screen
            name="AlreadyRegistered"
            component={AlreadyRegisteredScreen}
            options={{ title: "Already Registered" }}
          />
          <RootStack.Screen
            name="ConfirmVoterDetails"
            component={ConfirmVoterDetailsScreen}
            options={{ title: "Confirm Details" }}
          />
          <RootStack.Screen
            name="Biometrics"
            component={FingerprintEnrollmentScreen}
            options={{ title: "Fingerprint Setup" }}
          />
          <RootStack.Screen
            name="FaceEnrollment"
            component={FaceEnrollmentScreen}
            options={{ title: "Face Setup" }}
          />
          <RootStack.Screen
            name="SetPassword"
            component={SetVoterPasswordScreen}
            options={{ title: "Create Password" }}
          />
          <RootStack.Screen
            name="AlreadyVoted"
            component={AlreadyVotedScreen}
            options={{ title: "Already Voted" }}
          />
          <RootStack.Screen
            name="RegistrationPending"
            component={RegistrationPendingScreen}
            options={{ title: "Registration Pending" }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </>
  );
}
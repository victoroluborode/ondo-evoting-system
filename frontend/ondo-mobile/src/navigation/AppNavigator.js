import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext } from '../context/AuthContext';
import { OfflineContext } from '../context/OfflineContext';
import OfflineBanner from '../components/OfflineBanner';
import VoterStack from './VoterStack';
import OfficerStack from './OfficerStack';
import AdminStack from './AdminStack';
import SplashScreen from '../screens/entry/SplashScreen';
import RoleSelectionScreen from '../screens/entry/RoleSelectionScreen';
import VoterLoginScreen from '../screens/entry/VoterLoginScreen';
import OfficerLoginScreen from '../screens/entry/OfficerLoginScreen';
import AdminLoginScreen from '../screens/entry/AdminLoginScreen';
import AccessDeniedScreen from '../screens/shared/AccessDeniedScreen';

const RootStack = createNativeStackNavigator();

export default function AppNavigator() {
  const { userRole } = useContext(AuthContext);
  const { isOffline } = useContext(OfflineContext);

  return (
    <>
      <OfflineBanner isOffline={isOffline} />
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {userRole === null && (
            <>
              <RootStack.Screen name="Splash" component={SplashScreen} />
              <RootStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
              <RootStack.Screen name="VoterLogin" component={VoterLoginScreen} />
              <RootStack.Screen name="OfficerLogin" component={OfficerLoginScreen} />
              <RootStack.Screen name="AdminLogin" component={AdminLoginScreen} />
            </>
          )}

          {userRole === 'voter' && (
            <RootStack.Screen name="VoterFlow" component={VoterStack} />
          )}

          {userRole === 'officer' && (
            <RootStack.Screen name="OfficerFlow" component={OfficerStack} />
          )}

          {userRole === 'admin' && (
            <RootStack.Screen name="AdminFlow" component={AdminStack} />
          )}

          <RootStack.Screen name="AccessDenied" component={AccessDeniedScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </>
  );
}

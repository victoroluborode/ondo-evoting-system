import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ElectionManagementScreen from '../screens/admin/ElectionManagementScreen';
import ResultCollationScreen from '../screens/admin/ResultCollationScreen';
import OfflineSyncMonitorScreen from '../screens/admin/OfflineSyncMonitorScreen';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
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
        component={AdminDashboardScreen}
        options={{ title: 'Admin Command Center' }}
      />
      <Stack.Screen
        name="ElectionMgmt"
        component={ElectionManagementScreen}
        options={{ title: 'Election Management' }}
      />
      <Stack.Screen
        name="ResultCollation"
        component={ResultCollationScreen}
        options={{ title: 'Result Collation' }}
      />
      <Stack.Screen
        name="OfflineSync"
        component={OfflineSyncMonitorScreen}
        options={{ title: 'Offline Sync Monitor' }}
      />
    </Stack.Navigator>
  );
}

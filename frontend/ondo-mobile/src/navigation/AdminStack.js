import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { colors } from "../theme";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import ElectionManagementScreen from "../screens/admin/ElectionManagementScreen";
import ResultCollationScreen from "../screens/admin/ResultCollationScreen";
import ConstituencyResultScreen from "../screens/admin/ConstituencyResultScreen";
import VoterManagementScreen from "../screens/admin/VoterManagementScreen";
import VoterDetailScreen from "../screens/admin/VoterDetailScreen";
import ConstituencyManagementScreen from "../screens/admin/ConstituencyManagementScreen";
import ConstituencyDetailScreen from "../screens/admin/ConstituencyDetailScreen";
import AuditSecurityScreen from "../screens/admin/AuditSecurityScreen";
import PartyManagementScreen from "../screens/admin/PartyManagementScreen";
import CandidateManagementScreen from "../screens/admin/CandidateManagementScreen";
import PendingVotersScreen from "../screens/admin/PendingVotersScreen";


const Stack = createNativeStackNavigator();

export default function AdminStack() {
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
        component={AdminDashboardScreen}
        options={{ title: "Admin Command Center" }}
      />
      <Stack.Screen
        name="ElectionMgmt"
        component={ElectionManagementScreen}
        options={{ title: "Election Management" }}
      />
      <Stack.Screen
        name="ResultCollation"
        component={ResultCollationScreen}
        options={{ title: "Result Collation" }}
      />
      <Stack.Screen
        name="ConstituencyResult"
        component={ConstituencyResultScreen}
        options={{ title: "Constituency Result" }}
      />
      <Stack.Screen
        name="VoterManagement"
        component={VoterManagementScreen}
        options={{ title: "Voter Management" }}
      />
      <Stack.Screen
        name="VoterDetail"
        component={VoterDetailScreen}
        options={{ title: "Voter Record" }}
      />
      <Stack.Screen
        name="ConstituencyManagement"
        component={ConstituencyManagementScreen}
        options={{ title: "Constituency Management" }}
      />
      <Stack.Screen
        name="ConstituencyDetail"
        component={ConstituencyDetailScreen}
        options={{ title: "Constituency Detail" }}
      />
      <Stack.Screen
        name="AuditSecurity"
        component={AuditSecurityScreen}
        options={{ title: "Audit & Security" }}
      />
      <Stack.Screen
        name="PartyManagement"
        component={PartyManagementScreen}
        options={{ title: "Political Parties" }}
      />
      <Stack.Screen
        name="CandidateManagement"
        component={CandidateManagementScreen}
        options={{ title: "Candidates" }}
      />
      <Stack.Screen
        name="PendingVoters"
        component={PendingVotersScreen}
        options={{ title: "Pending Voters" }}
      />
    </Stack.Navigator>
  );
}

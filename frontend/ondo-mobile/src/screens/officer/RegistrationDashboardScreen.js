import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { ActionCard, StatPanel, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function RegistrationDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <StatPanel
          label="Session Registrations"
          value="42"
          footnote="Akure South LGA · Active partition"
        />

        <Text style={[typography.h2, styles.quickTitle]}>Quick Actions</Text>

        <ActionCard
          icon="+"
          title="Register New Voter"
          subtitle="Initiate biometric TEE enrolment"
          onPress={() => navigation.navigate('VoterDetails')}
        />

        <ActionCard
          icon="↻"
          title="View Sync Queue"
          subtitle="Inspect encrypted records awaiting upload"
          onPress={() => navigation.navigate('OfflineQueue')}
        />

        <View style={styles.spacer} />
        <CustomButton title="End Session & Logout" variant="secondary" onPress={logout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md, flex: 1 },
  quickTitle: { marginBottom: spacing.md },
  spacer: { flex: 1 },
});

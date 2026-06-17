import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ActionCard, ScreenHeader, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing } from '../../theme';

export default function RoleSelectionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        <ScreenHeader
          eyebrow="Welcome"
          title="Select Portal"
          subtitle="Choose your operational role to access the correct system gateway."
        />

        <ActionCard
          icon="▣"
          title="Voter"
          subtitle="Accreditation & ballot access"
          onPress={() => navigation.navigate('VoterLogin')}
        />

        <ActionCard
          icon="♙"
          title="Electoral Officer"
          subtitle="Voter registration & enrolment"
          onPress={() => navigation.navigate('OfficerLogin')}
        />

        <ActionCard
          icon="◇"
          title="System Admin"
          subtitle="Election setup & result collation"
          onPress={() => navigation.navigate('AdminLogin')}
        />

        <Text style={styles.footerNote}>
          All sessions are logged and audited. Unauthorised access is prohibited.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { ...sharedStyles.centeredContent },
  footerNote: {
    marginTop: spacing.lg,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
  },
});

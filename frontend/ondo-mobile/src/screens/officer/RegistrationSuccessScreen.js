import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { OfflineContext } from '../../context/OfflineContext';
import { ProgressTabs, StatusChip, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function RegistrationSuccessScreen({ navigation }) {
  const { addToRegistrationQueue } = useContext(OfflineContext);

  // Demonstrates local registration queueing for low-connectivity centres.
  const queueRegistration = () => {
    addToRegistrationQueue({ type: 'registration', queuedAt: Date.now() });
    navigation.navigate('OfflineQueue');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressTabs active={2} items={['Demographics', 'Biometrics', 'Confirm']} />
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={[typography.h2, styles.title]}>Voter Registered</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Identity and biometrics written to the Akure South partition. Record is queued for server sync.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>VIN</Text><Text style={styles.summaryValue}>XA9-2027-AKES</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Partition</Text><Text style={styles.summaryValue}>Akure South LGA</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Sync status</Text><StatusChip label="Queued" tone="amber" /></View>
        </View>

        <CustomButton title="View Local Sync Queue" variant="secondary" onPress={queueRegistration} />
        <CustomButton
          title="Register Next Voter"
          onPress={() => navigation.navigate('Dashboard')}
          style={{ marginTop: spacing.md }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md, flex: 1, justifyContent: 'center' },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  icon: { color: colors.primary, fontSize: 28, fontWeight: '900' },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { textAlign: 'center', marginBottom: spacing.xl },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryLabel: { fontSize: 12, color: colors.textMuted },
  summaryValue: { fontSize: 12, fontWeight: '800', color: colors.primary },
});

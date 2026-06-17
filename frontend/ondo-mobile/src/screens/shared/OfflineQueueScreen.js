import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { OfflineContext } from '../../context/OfflineContext';
import CustomButton from '../../components/CustomButton';
import { ScreenHeader, StatusChip, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function OfflineQueueScreen() {
  const { isOffline, pendingVotes, pendingRegistrations, syncQueue } = useContext(OfflineContext);
  const [syncing, setSyncing] = useState(false);

  // Allows a user or officer to manually retry local queue transmission.
  const handleManualSync = async () => {
    setSyncing(true);
    await syncQueue();
    setTimeout(() => setSyncing(false), 1500);
  };

  const totalPending = pendingVotes.length + pendingRegistrations.length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Local Sync Queue"
          subtitle="Offline-first architecture active. Encrypted records are held securely on-device until a connection is available."
        />

        <View style={styles.statusCard}>
          <View>
            <Text style={styles.statusLabel}>Network Status</Text>
            <Text style={[styles.statusValue, { color: isOffline ? colors.warning : colors.success }]}>
              {isOffline ? 'Disconnected (Offline)' : 'Connected (Online)'}
            </Text>
          </View>
          <StatusChip label={isOffline ? '• Offline' : '• Live'} tone={isOffline ? 'amber' : 'green'} />
        </View>

        <View style={styles.queueContainer}>
          <Text style={styles.sectionLabel}>Pending Transmissions</Text>

          <View style={styles.queueItem}>
            <Text style={styles.queueItemLabel}>Encrypted Votes Pending</Text>
            <Text style={styles.queueItemCount}>{pendingVotes.length}</Text>
          </View>

          <View style={styles.queueItem}>
            <Text style={styles.queueItemLabel}>Registrations Pending</Text>
            <Text style={styles.queueItemCount}>{pendingRegistrations.length}</Text>
          </View>
        </View>

        <CustomButton
          title={isOffline ? 'Waiting for Network...' : 'Force Sync Now'}
          onPress={handleManualSync}
          loading={syncing}
          disabled={isOffline || totalPending === 0}
          style={{ marginTop: spacing.xxl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  statusLabel: { ...typography.label, marginBottom: 4 },
  statusValue: { fontSize: 14, fontWeight: '900' },
  queueContainer: { marginTop: spacing.md },
  sectionLabel: { ...typography.label, marginBottom: spacing.sm },
  queueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  queueItemLabel: { fontSize: 13, fontWeight: '800', color: colors.text },
  queueItemCount: { fontSize: 22, fontWeight: '900', color: colors.primary },
});

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { ScreenHeader, StatPanel, StatusChip, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function OfflineSyncMonitorScreen() {
  const syncNodes = [
    { name: 'Akure South Node', status: 'Synced', pending: 0 },
    { name: 'Ondo West Node', status: 'Offline', pending: 142 },
    { name: 'Okitipupa Node', status: 'Syncing', pending: 18 },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Offline Sync Monitor"
          subtitle="Monitor remote polling units and constituency transmission streams."
        />

        <StatPanel label="Encrypted Records Pending" value="160" />

        <Text style={[typography.h2, styles.sectionTitle]}>Constituency Nodes</Text>

        {syncNodes.map((node) => (
          <View key={node.name} style={styles.nodeCard}>
            <View>
              <Text style={styles.nodeName}>{node.name}</Text>
              <StatusChip
                label={`• ${node.status}`}
                tone={node.status === 'Offline' ? 'red' : node.status === 'Syncing' ? 'amber' : 'green'}
              />
            </View>
            <Text style={styles.pendingText}>{node.pending} pending</Text>
          </View>
        ))}

        <CustomButton title="Request Global Sync Ping" variant="outline" style={{ marginTop: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.md },
  nodeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  nodeName: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 6 },
  pendingText: { fontSize: 12, fontWeight: '800', color: colors.textMid },
});

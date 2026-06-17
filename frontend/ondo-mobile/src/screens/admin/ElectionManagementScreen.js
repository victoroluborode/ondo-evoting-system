import React from 'react';
import { Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { ActionCard, NoticeBox, ScreenHeader, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing } from '../../theme';

export default function ElectionManagementScreen() {
  const tasks = [
    { label: 'Configure Election Settings', status: 'Completed' },
    { label: 'Upload Candidate Information', status: 'Pending' },
    { label: 'Assign to Constituencies', status: 'Pending' },
    { label: 'Verify Ballot Routing', status: 'Pending' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="Pre-Election Setup" chip="Draft" />

        {tasks.map((task) => (
          <ActionCard
            key={task.label}
            title={task.label}
            subtitle={task.status}
            right={<Text style={styles.arrow}>›</Text>}
            selected={task.status === 'Completed'}
          />
        ))}

        <NoticeBox title="Action Required" tone="warning">
          Complete all setup tasks before activating the election session.
        </NoticeBox>

        <CustomButton
          title="Activate Election Session"
          variant="danger"
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md },
  arrow: { fontSize: 18, color: colors.border, fontWeight: '900' },
});

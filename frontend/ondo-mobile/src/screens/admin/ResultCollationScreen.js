import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { NoticeBox, ScreenHeader, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function ResultCollationScreen() {
  const [collating, setCollating] = useState(false);
  const [resultsReady, setResultsReady] = useState(false);

  // Simulates integrity verification against encrypted partitioned vote records.
  const handleCollation = () => {
    setCollating(true);
    setTimeout(() => {
      setCollating(false);
      setResultsReady(true);
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="Result Collation"
          subtitle="Fetch and verify isolated vote counts across all 9 Federal Constituencies."
        />

        {!resultsReady ? (
          <View style={styles.actionContainer}>
            <CustomButton
              title="Verify Integrity & Collate"
              onPress={handleCollation}
              loading={collating}
              style={{ width: '100%' }}
            />
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <NoticeBox tone="success">
              Integrity verified — no cross-constituency anomalies detected across all 9 partitions.
            </NoticeBox>

            <Text style={styles.sectionLabel}>Constituency Results</Text>
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Akure North / Akure South</Text><Text style={styles.resultValue}>42,105</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Idanre / Ifedore</Text><Text style={styles.resultValue}>38,720</Text></View>
            <View style={styles.resultRow}><Text style={styles.resultLabel}>Ondo East / Ondo West</Text><Text style={styles.resultValue}>51,340</Text></View>
            <Text style={styles.moreText}>+ 6 more constituencies</Text>

            <CustomButton title="Generate Official Election Reports" style={{ marginTop: spacing.xl }} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md },
  actionContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resultsContainer: { marginTop: spacing.md },
  sectionLabel: { ...typography.label, marginTop: spacing.lg, marginBottom: spacing.sm },
  resultRow: {
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
  resultLabel: { fontSize: 12, color: colors.text, fontWeight: '800' },
  resultValue: { fontSize: 14, color: colors.primary, fontWeight: '900' },
  moreText: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
});

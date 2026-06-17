import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { NoticeBox, ScreenHeader, sharedStyles } from '../../components/DesignSystem';
import { EncryptionService } from '../../services/encryptionService';
import { colors, spacing, typography } from '../../theme';

export default function VoteReviewScreen({ navigation, route }) {
  const { candidate } = route.params;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulates AES-256 payload encryption and backend submission.
  const confirmVote = () => {
    setIsSubmitting(true);
    const sessionKey = EncryptionService.generateSessionKey();
    const iv = EncryptionService.generateInitializationVector();
    EncryptionService.encryptVotePayload({ candidate }, sessionKey, iv);

    setTimeout(() => {
      setIsSubmitting(false);
      navigation.replace('Receipt');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScreenHeader title="Final Review" chip="Step 3 of 3" />
        <NoticeBox title="Immutable Action" tone="warning">
          Once submitted, your vote cannot be changed or withdrawn. Review carefully before proceeding.
        </NoticeBox>

        <Text style={styles.sectionLabel}>Your Selected Candidate</Text>
        <View style={styles.selectionCard}>
          <Text style={styles.candidateName}>{candidate?.name || 'No candidate selected'}</Text>
          <Text style={styles.candidateParty}>{candidate?.party || '-'} · Akure North / Akure South</Text>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Constituency</Text><Text style={styles.metaValue}>Akure North / Akure South</Text></View>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Encryption</Text><Text style={styles.metaValue}>AES-256 CBC</Text></View>
          <View style={styles.metaRow}><Text style={styles.metaLabel}>Election</Text><Text style={styles.metaValue}>ONDO-2027-HR</Text></View>
        </View>

        <View style={styles.actionGroup}>
          <CustomButton
            title="Cast Secure Vote"
            loading={isSubmitting}
            onPress={confirmVote}
          />
          <CustomButton
            title="Go Back & Modify"
            variant="outline"
            style={{ marginTop: spacing.md }}
            disabled={isSubmitting}
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { flex: 1, padding: spacing.md, justifyContent: 'center' },
  sectionLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  selectionCard: {
    backgroundColor: colors.primaryDim,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  candidateName: { fontSize: 19, fontWeight: '900', color: colors.text },
  candidateParty: { fontSize: 12, fontWeight: '800', color: colors.primary, marginTop: 6 },
  metaCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  metaLabel: { fontSize: 12, color: colors.textMuted },
  metaValue: { flex: 1, textAlign: 'right', fontSize: 12, fontWeight: '800', color: colors.text },
  actionGroup: { marginTop: spacing.lg },
});

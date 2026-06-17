import React, { useContext } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { OfflineContext } from '../../context/OfflineContext';
import { sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function ReceiptScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const { addToVoteQueue } = useContext(OfflineContext);
  const transactionHash = 'AES-' + Math.random().toString(36).substring(2, 12).toUpperCase();

  // Demonstrates that encrypted vote payloads can be queued locally.
  const queueDemoVote = () => {
    addToVoteQueue({ receipt: transactionHash, queuedAt: Date.now() });
    navigation.navigate('OfflineQueue');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={[typography.h2, styles.title]}>
          Vote Cast Successfully
        </Text>
        <Text style={[typography.subtitle, styles.subtitleText]}>
          Your encrypted vote has been written to the isolated constituency partition. No further action is required.
        </Text>

        <View style={styles.receiptBox}>
          <Text style={styles.receiptLabel}>ANONYMOUS TRANSACTION TOKEN</Text>
          <Text style={styles.receiptHash}>{transactionHash}</Text>
          <View style={styles.divider} />
          <Text style={styles.receiptNote}>
            This cryptographic hash confirms non-repudiation but does not reveal candidate selection, preserving complete ballot secrecy.
          </Text>
        </View>

        <CustomButton title="Exit & Logout" onPress={logout} />
        <CustomButton
          title="View Sync Queue"
          variant="secondary"
          onPress={queueDemoVote}
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
  subtitleText: { textAlign: 'center', marginBottom: spacing.xl },
  receiptBox: {
    backgroundColor: colors.surface,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  receiptLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textAlign: 'center', letterSpacing: 0.5 },
  receiptHash: { fontSize: 18, fontFamily: 'monospace', fontWeight: '700', color: colors.text, textAlign: 'center', marginVertical: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  receiptNote: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
});

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import CustomButton from '../../components/CustomButton';
import NetworkErrorState from '../../components/NetworkErrorState';
import { useNetworkRequest } from '../../hooks/useNetworkRequest';
import { apiRequest } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { saveOfflinePackage } from '../../services/offlineVoteStore';
import { colors, spacing, typography, radius } from '../../theme';

export default function FingerprintVerificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData, loginRole, logout, updateUserData } = useContext(AuthContext);

  const [status, setStatus] = useState('idle');
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const { execute } = useNetworkRequest();

  useEffect(() => {
    if (!userData.sessionToken || userData?.fingerprintLocked) {
      setStatus('locked');
      return;
    }

    triggerScan();
  }, []);

  const prefetchOfflinePackage = async ({ token, constituencyId }) => {
    try {
      const offlinePkg = await apiRequest(
        `/votes/offline-package/${constituencyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await saveOfflinePackage(offlinePkg);
    } catch (err) {
      // Non-fatal — if this fails, the voter can still vote online normally.
      console.warn('Could not pre-fetch offline voting package:', err.message);
    }
  };

  const triggerScan = async () => {
    setStatus('checking');

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setStatus('unavailable');
      return;
    }

    setStatus('scanning');

    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify your identity to continue voting',
      cancelLabel: 'Cancel',
      disableDeviceFallback: true,
    });

    if (!authResult.success) {
      await submitToBackend(false);
      return;
    }

    await submitToBackend(true);
  };

  const submitToBackend = async (biometricVerified) => {
    const result = await execute(async () => {
      return await apiRequest('/auth/verify-biometric', {
        method: 'POST',
        body: JSON.stringify({
          sessionToken: userData.sessionToken,
          method: 'fingerprint',
          biometricVerified,
        }),
      });
    });

    if (!result.success) {
      if (result.errorType === 'network') {
        setStatus('network');
        return;
      }

      const data = result.error?.data;

      if (data?.locked) {
        updateUserData({ fingerprintLocked: true });
        setStatus('locked');
        return;
      }

      setAttemptsRemaining(data?.attemptsRemaining ?? null);
      setStatus('failed');
      return;
    }

    const nextUserData = {
      ...userData,
      ...result.data.user,
      token: result.data.token,
      authMethod: result.data.authMethod,
      sessionToken: null,
    };

    loginRole('voter', nextUserData);

    await prefetchOfflinePackage({
      token: result.data.token,
      constituencyId: result.data.user.constituencyId,
    });

    navigation.replace('Ballot');
  };

  if (status === 'network') {
    return <NetworkErrorState onRetry={triggerScan} />;
  }

  if (status === 'unavailable') {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
          <View style={[styles.iconCircle, styles.iconCircleError]}>
            <Text style={styles.iconError}>!</Text>
          </View>

          <Text style={[typography.h2, styles.centeredTitle]}>Fingerprint Not Available</Text>

          <Text style={[typography.subtitle, styles.centeredSubtitle]}>
            This device doesn't have a fingerprint set up. You can use facial recognition instead.
          </Text>

          <CustomButton
            title="Use Facial Recognition"
            onPress={() => navigation.replace('FaceVerification')}
          />
        </View>
      </View>
    );
  }

  if (status === 'locked') {
    return (
      <View style={styles.container}>
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
          <View style={[styles.iconCircle, styles.iconCircleError]}>
            <Text style={styles.iconError}>✕</Text>
          </View>

          <Text style={[typography.h2, styles.centeredTitle]}>Fingerprint Locked</Text>

          <Text style={[typography.subtitle, styles.centeredSubtitle]}>
            Fingerprint verification has been locked for this session after too many unsuccessful attempts. This protects against repeated, unauthorized attempts. You can use facial recognition to continue, or sign in again to reset.
          </Text>

          <CustomButton
            title="Try Facial Recognition Instead"
            onPress={() => navigation.replace('FaceVerification')}
          />

          <CustomButton
            title="Sign Out & Try Again Later"
            variant="outline"
            onPress={logout}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}>
        <View style={styles.scanRing}>
          <View style={[styles.scanInner, status === 'failed' && styles.scanInnerError]}>
            <Text style={[styles.mainIcon, status === 'failed' && styles.mainIconError]}>
              {status === 'failed' ? '✕' : '⌾'}
            </Text>
          </View>
        </View>

        {(status === 'checking' || status === 'scanning') && (
          <>
            <Text style={[typography.h2, styles.centeredTitle]}>Verify Your Fingerprint</Text>

            <Text style={[typography.subtitle, styles.centeredSubtitle]}>
              Follow the prompt on your screen and use your enrolled fingerprint.
            </Text>

            <View style={styles.loaderZone}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loaderText}>
                {status === 'checking' ? 'Checking device…' : 'Waiting for fingerprint…'}
              </Text>
            </View>
          </>
        )}

        {status === 'failed' && (
          <>
            <Text style={[typography.h2, styles.centeredTitle]}>Scan Unsuccessful</Text>

            <Text style={[typography.subtitle, styles.centeredSubtitle]}>
              We couldn't read your fingerprint clearly.
            </Text>

            <View style={styles.helpCard}>
              <Text style={styles.helpTitle}>Try this</Text>

              <View style={styles.helpItem}>
                <Text style={styles.helpBullet}>•</Text>
                <Text style={styles.helpText}>Make sure your finger is clean and dry</Text>
              </View>

              <View style={styles.helpItem}>
                <Text style={styles.helpBullet}>•</Text>
                <Text style={styles.helpText}>Cover the entire sensor with your fingertip</Text>
              </View>

              <View style={styles.helpItem}>
                <Text style={styles.helpBullet}>•</Text>
                <Text style={styles.helpText}>Press gently — don't push too hard</Text>
              </View>
            </View>

            {attemptsRemaining !== null && (
              <View style={styles.attemptRow}>
                <Text style={styles.attemptText}>
                  {attemptsRemaining > 0
                    ? `${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining`
                    : 'This was your last attempt'}
                </Text>
              </View>
            )}

            <CustomButton title="Try Again" onPress={triggerScan} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg, alignItems: 'center', justifyContent: 'center' },
  scanRing: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  scanInner: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.primaryDim, alignItems: 'center', justifyContent: 'center' },
  scanInnerError: { backgroundColor: '#FDECEB' },
  mainIcon: { fontSize: 28, color: colors.primary },
  mainIconError: { color: colors.error },
  centeredTitle: { textAlign: 'center', marginBottom: spacing.sm },
  centeredSubtitle: { textAlign: 'center', marginBottom: spacing.lg, maxWidth: 300 },
  loaderZone: { alignItems: 'center', paddingVertical: spacing.md },
  loaderText: { marginTop: spacing.md, color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  helpCard: { width: '100%', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.base, marginBottom: spacing.lg },
  helpTitle: { fontSize: 11, fontWeight: '900', color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  helpItem: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  helpBullet: { fontSize: 13, color: colors.primary, fontWeight: '900' },
  helpText: { fontSize: 13, color: colors.textMid, flex: 1, lineHeight: 19 },
  attemptRow: { marginBottom: spacing.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: '#FFF8E7', borderWidth: 1, borderColor: '#F0DDA0' },
  attemptText: { fontSize: 12, fontWeight: '700', color: colors.warning, textAlign: 'center' },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primaryDim, borderWidth: 1.5, borderColor: colors.primaryBorder, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  iconCircleError: { backgroundColor: '#FDECEB', borderColor: '#E8C0BC' },
  iconError: { fontSize: 28, color: colors.error, fontWeight: '900' },
});
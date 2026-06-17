import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { NoticeBox, ScreenHeader, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function AdminLoginScreen({ navigation }) {
  const { loginRole } = useContext(AuthContext);
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [biometricStep, setBiometricStep] = useState(false);

  // First stage verifies admin credentials before biometric authorization.
  const handleInitialLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setBiometricStep(true);
    }, 1000);
  };

  // Second stage simulates biometric MFA and RBAC enforcement.
  const handleBiometricAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginRole('admin', { id: adminId });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenHeader
          title="Admin Access"
          subtitle="Multi-factor authentication is required before entry to the admin portal."
          chip="Admin"
        />

        {!biometricStep ? (
          <>
            <CustomInput
              label="Admin ID / Username"
              placeholder="e.g., ADM-ONDO-001"
              autoCapitalize="characters"
              value={adminId}
              onChangeText={setAdminId}
            />
            <CustomInput
              label="Password"
              placeholder="Enter secure password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.buttonContainer}>
              <CustomButton
                title="Verify Credentials"
                onPress={handleInitialLogin}
                loading={loading}
                disabled={!adminId || !password}
              />
              <CustomButton
                title="Go Back"
                variant="secondary"
                style={{ marginTop: spacing.md }}
                onPress={() => navigation.goBack()}
              />
              <NoticeBox title="Next step" tone="neutral">
                Biometric verification and role-based access control are applied after password confirmation.
              </NoticeBox>
            </View>
          </>
        ) : (
          <View style={styles.biometricContainer}>
            <View style={styles.biometricOrb}>
              <Text style={styles.biometricIcon}>⌾</Text>
            </View>
            <Text style={[typography.h2, styles.biometricTitle]}>Biometric Authorization</Text>
            <Text style={[typography.subtitle, styles.biometricCopy]}>
              Verify your identity to satisfy Role-Based Access Control (RBAC) requirements.
            </Text>
            <CustomButton
              title="Scan Admin Fingerprint"
              onPress={handleBiometricAuth}
              loading={loading}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { ...sharedStyles.centeredContent },
  buttonContainer: { marginTop: spacing.lg, gap: spacing.md },
  biometricContainer: { alignItems: 'center', marginTop: spacing.lg },
  biometricOrb: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  biometricIcon: { fontSize: 50, color: colors.primary },
  biometricTitle: { textAlign: 'center', marginBottom: spacing.sm },
  biometricCopy: { textAlign: 'center', marginBottom: spacing.xl },
});

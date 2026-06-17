import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { NoticeBox, ScreenHeader, sharedStyles } from '../../components/DesignSystem';
import { spacing } from '../../theme';

export default function VoterLoginScreen() {
  const { loginRole } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulates backend login until the API service is wired in.
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginRole('voter', { vin: identifier });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenHeader
          title="Welcome back"
          subtitle="Enter your credentials to access your constituency ballot."
          chip="Voter"
        />

        <CustomInput
          label="VIN / Email Address"
          placeholder="Enter VIN or Email"
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
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
          title="Authenticate"
            onPress={handleLogin}
            loading={loading}
            disabled={!identifier || !password}
          />
          <NoticeBox title="Next step" tone="neutral">
            Successful login issues a short session token before biometric verification.
          </NoticeBox>
          <CustomButton
            title="Forgot Password?"
            variant="secondary"
            style={{ marginTop: spacing.md }}
            onPress={() => {}}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { ...sharedStyles.centeredContent },
  buttonContainer: { marginTop: spacing.lg, gap: spacing.md },
});

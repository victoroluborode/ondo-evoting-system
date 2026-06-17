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
import { ScreenHeader, sharedStyles } from '../../components/DesignSystem';
import { spacing } from '../../theme';

export default function OfficerLoginScreen({ navigation }) {
  const { loginRole } = useContext(AuthContext);
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Simulates secure officer authentication before backend wiring.
  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginRole('officer', { id: officerId });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScreenHeader
          title="Electoral Officer"
          subtitle="Enter your authorised Officer ID and passcode to access the registration dashboard."
          chip="Officer"
        />

        <CustomInput
          label="Officer ID"
          placeholder="Enter ID (e.g., OFF-1002)"
          autoCapitalize="characters"
          value={officerId}
          onChangeText={setOfficerId}
        />
        <CustomInput
          label="Passcode"
          placeholder="Enter secure passcode"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.buttonContainer}>
          <CustomButton
            title="Secure Login"
            onPress={handleLogin}
            loading={loading}
            disabled={!officerId || !password}
          />
          <CustomButton
            title="Go Back"
            variant="secondary"
            style={{ marginTop: spacing.md }}
            onPress={() => navigation.goBack()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { ...sharedStyles.centeredContent },
  buttonContainer: { marginTop: spacing.lg },
});

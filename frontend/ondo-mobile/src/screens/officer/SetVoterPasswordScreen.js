import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { ProgressTabs, sharedStyles } from '../../components/DesignSystem';
import { spacing } from '../../theme';

export default function SetVoterPasswordScreen({ route, navigation }) {
  const { voterData } = route.params;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  // Finalizes the supervised voter registration record.
  const handleFinalize = () => {
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Success', { voterData });
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressTabs active={2} items={['Demographics', 'Biometrics', 'Confirm']} />
        <CustomInput
          label="Set Voter Passcode"
          placeholder="Enter secure key"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <CustomInput
          label="Confirm Passcode"
          placeholder="Re-enter secure key"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <CustomButton
          style={{ marginTop: spacing.lg }}
          title="Finalize Registration"
          onPress={handleFinalize}
          loading={loading}
          disabled={!password || !confirm}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md, flex: 1 },
});

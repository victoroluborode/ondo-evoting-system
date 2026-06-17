import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import { ProgressTabs, sharedStyles } from '../../components/DesignSystem';
import { spacing } from '../../theme';

export default function VoterDetailsScreen({ navigation }) {
  const [form, setForm] = useState({ name: '', vin: '', phone: '', lga: '' });
  const [validating, setValidating] = useState(false);

  // Simulates VIN registry validation and duplicate registration checks.
  const handleNext = () => {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      if (form.vin.length < 5) {
        Alert.alert('Invalid VIN', 'The VIN provided failed validation against the registry.');
        return;
      }
      navigation.navigate('Biometrics', { voterData: form });
    }, 1500);
  };

  const isFormValid = form.name && form.vin && form.phone && form.lga;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProgressTabs active={0} items={['Demographics', 'Biometrics', 'Confirm']} />
        <CustomInput
          label="Full Legal Name"
          placeholder="Last Name, First Name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />
        <CustomInput
          label="Voter Identification Number (VIN)"
          placeholder="19-Digit Alphanumeric Code"
          autoCapitalize="characters"
          value={form.vin}
          onChangeText={(text) => setForm({ ...form, vin: text })}
        />
        <CustomInput
          label="Phone Number"
          placeholder="080XXXXXXXX"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(text) => setForm({ ...form, phone: text })}
        />
        <CustomInput
          label="Constituency / LGA"
          placeholder="e.g., Akure South LGA"
          value={form.lga}
          onChangeText={(text) => setForm({ ...form, lga: text })}
        />

        <CustomButton
          style={{ marginTop: spacing.lg }}
          title="Validate & Proceed"
          onPress={handleNext}
          loading={validating}
          disabled={!isFormValid}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md },
});

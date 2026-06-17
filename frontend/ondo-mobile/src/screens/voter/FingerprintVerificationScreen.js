import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function FingerprintVerificationScreen({ navigation }) {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    triggerScan();
  }, []);

  // Simulates Android BiometricPrompt success before the real native module is wired.
  const triggerScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      navigation.replace('Ballot');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.scanRing}>
          <View style={styles.scanInner}>
            <Text style={styles.mainIcon}>⌾</Text>
          </View>
        </View>
        <Text style={[typography.h2, styles.title]}>
          Place Finger on Sensor
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Hold still while the sensor reads your enrolled fingerprint. Keep light pressure on the sensor.
        </Text>

        {isScanning ? (
          <View style={styles.loaderZone}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loaderText}>Reading fingerprint...</Text>
          </View>
        ) : (
          <CustomButton title="Retry Scan" onPress={triggerScan} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { ...sharedStyles.centeredContent },
  scanRing: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  scanInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainIcon: { fontSize: 26, color: colors.primary },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { textAlign: 'center', marginBottom: spacing.xl },
  loaderZone: { alignItems: 'center', paddingVertical: spacing.lg },
  loaderText: { marginTop: spacing.md, color: colors.textMuted, fontSize: 13 },
});

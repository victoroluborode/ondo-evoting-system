import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { ActionCard, NoticeBox, ProgressTabs, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function BiometricEnrollmentScreen({ route, navigation }) {
  const { voterData } = route.params;
  const [fpEnrolled, setFpEnrolled] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);

  // Registration requires both modalities before moving to password setup.
  const simulateEnrollment = (type) => {
    if (type === 'fp') setFpEnrolled(true);
    if (type === 'face') setFaceEnrolled(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ProgressTabs active={1} items={['Demographics', 'Biometrics', 'Confirm']} />
        <Text style={typography.subtitle}>
          Capture both modalities. Templates are encrypted with AES-256 and stored in the device Trusted Execution Environment.
        </Text>

        <ActionCard
          icon="✓"
          title={fpEnrolled ? 'Fingerprint Captured' : 'Fingerprint Capture'}
          subtitle={fpEnrolled ? 'Template stored in TEE · 3 fingers' : 'Tap to scan multiple angles'}
          selected={fpEnrolled}
          right={fpEnrolled ? <Text style={styles.check}>✓</Text> : null}
          onPress={() => simulateEnrollment('fp')}
        />

        <ActionCard
          icon="✓"
          title={faceEnrolled ? 'Facial Mapping Complete' : 'Facial Mapping'}
          subtitle={faceEnrolled ? 'FaceNet embedding stored in TEE' : 'Tap to extract face embedding'}
          selected={faceEnrolled}
          right={faceEnrolled ? <Text style={styles.check}>✓</Text> : null}
          onPress={() => simulateEnrollment('face')}
        />

        {fpEnrolled && faceEnrolled ? (
          <NoticeBox tone="success">
            Both templates captured. No raw biometric data will leave this device.
          </NoticeBox>
        ) : null}

        <View style={styles.spacer} />
        <CustomButton
          title="Confirm Biometrics"
          onPress={() => navigation.navigate('SetPassword', { voterData })}
          disabled={!fpEnrolled || !faceEnrolled}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md, flex: 1 },
  check: { color: colors.success, fontSize: 18, fontWeight: '900' },
  spacer: { flex: 1 },
});

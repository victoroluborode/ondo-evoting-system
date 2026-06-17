import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { ActionCard, NoticeBox, ScreenHeader, sharedStyles } from '../../components/DesignSystem';

export default function BiometricChoiceScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <ScreenHeader
          title="Verify Identity"
          subtitle="Access is granted on successful verification from either method: fingerprint or facial recognition."
          chip="Step 1 of 3"
        />

        <ActionCard
          icon="⌾"
          title="Fingerprint Scan"
          subtitle="Use the device hardware sensor"
          onPress={() => navigation.navigate('FingerprintVerification')}
        />

        <ActionCard
          icon="◎"
          title="Facial Recognition"
          subtitle="On-device camera pipeline"
          onPress={() => navigation.navigate('FaceVerification')}
        />

        <NoticeBox tone="neutral">
          Voters with worn fingerprints may proceed directly to facial recognition.
        </NoticeBox>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { ...sharedStyles.centeredContent },
});

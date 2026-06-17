import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function FaceVerificationScreen({ navigation }) {
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    triggerCamera();
  }, []);

  // Simulates the local TensorFlow Lite face pipeline.
  const triggerCamera = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      navigation.replace('Ballot');
    }, 2500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.cameraPlaceholder}>
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          {isScanning ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Text style={styles.cameraIcon}>♙</Text>
          )}
        </View>

        <Text style={[typography.h2, styles.title]}>
          Align Your Face
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          {isScanning
            ? 'Detecting face and checking liveness...'
            : 'Centre your face in the frame and look directly at the camera. Keep still.'}
        </Text>

        {!isScanning && (
          <CustomButton title="Initiate Camera" onPress={triggerCamera} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { ...sharedStyles.centeredContent },
  cameraPlaceholder: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.primaryDim,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryBorder,
  },
  cameraIcon: { fontSize: 42, color: colors.primary },
  corner: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderColor: colors.primary,
  },
  cornerTopLeft: { left: -16, top: 0, borderLeftWidth: 2, borderTopWidth: 2 },
  cornerTopRight: { right: -16, top: 0, borderRightWidth: 2, borderTopWidth: 2 },
  cornerBottomLeft: { left: -16, bottom: 0, borderLeftWidth: 2, borderBottomWidth: 2 },
  cornerBottomRight: { right: -16, bottom: 0, borderRightWidth: 2, borderBottomWidth: 2 },
  title: { textAlign: 'center', marginTop: spacing.xl, marginBottom: spacing.sm },
  subtitle: { textAlign: 'center', marginBottom: spacing.xl },
});

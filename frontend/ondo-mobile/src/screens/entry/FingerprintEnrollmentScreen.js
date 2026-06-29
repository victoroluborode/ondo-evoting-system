import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

export default function FingerprintEnrollmentScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { voterData } = route.params;
  const [fpEnrolled, setFpEnrolled] = useState(false);
  const [checking, setChecking] = useState(false);

  const enrollFingerprint = async () => {
    setChecking(true);

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      setChecking(false);
      Alert.alert(
        "Fingerprint unavailable",
        "This device does not have fingerprint authentication set up. You can still continue — facial recognition will be your primary verification method on this device.",
      );
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm fingerprint enrollment",
      cancelLabel: "Cancel",
      disableDeviceFallback: true,
    });

    setChecking(false);

    if (result.success) {
      setFpEnrolled(true);
    }
  };

  const handleContinue = () => {
    navigation.navigate("FaceEnrollment", {
      voterData: {
        ...voterData,
        fingerprintTemplate: fpEnrolled ? `fp-enrolled-${voterData.vin}` : null,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Text style={[typography.h1, styles.title]}>Confirm Fingerprint</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          We'll check that your device supports fingerprint authentication. This
          will be your default way to verify your identity on election day.
        </Text>

        <View style={styles.iconCircle}>
          <Text style={[styles.icon, fpEnrolled && styles.iconDone]}>
            {fpEnrolled ? "✓" : "⌾"}
          </Text>
        </View>

        {!fpEnrolled ? (
          <CustomButton
            title="Confirm Fingerprint"
            onPress={enrollFingerprint}
            loading={checking}
            disabled={checking}
          />
        ) : (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Fingerprint confirmed on this device.
            </Text>
          </View>
        )}

        <CustomButton
          title="Continue"
          onPress={handleContinue}
          disabled={!fpEnrolled}
          style={{ marginTop: spacing.md }}
        />

        {!fpEnrolled && (
          <CustomButton
            title="Skip — Use Face Verification Only"
            variant="outline"
            onPress={() => handleContinue()}
            style={{ marginTop: spacing.sm }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: "center" },
  title: { textAlign: "center", marginBottom: spacing.xs },
  subtitle: { textAlign: "center", marginBottom: spacing.xl },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryDim,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.xl,
  },
  icon: { fontSize: 36, color: colors.primary },
  iconDone: { fontWeight: "900" },
  notice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.primaryMid,
    textAlign: "center",
  },
});

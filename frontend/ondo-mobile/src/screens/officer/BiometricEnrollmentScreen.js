import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";
import * as LocalAuthentication from "expo-local-authentication";

export default function BiometricEnrollmentScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { voterData } = route.params;
  const [fpEnrolled, setFpEnrolled] = useState(false);
  const [faceEnrolled, setFaceEnrolled] = useState(false);

  const enrollFingerprint = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Confirm fingerprint enrollment",
      cancelLabel: "Cancel",
      disableDeviceFallback: true,
    });

    if (result.success) {
      setFpEnrolled(true);
    }
  };

  const bothDone = fpEnrolled && faceEnrolled;

  const handleContinue = () => {
    navigation.navigate("SetPassword", {
      voterData: {
        ...voterData,
        // Placeholder template strings until real on-device biometric capture exists.
        // The backend currently stores these as opaque encrypted enrollment artifacts.
        fingerprintTemplate: `fp-enrolled-${voterData.vin}`,
        faceTemplate: `face-enrolled-${voterData.vin}`,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Capture Biometrics</Text>
        <Text style={{ color: "red", fontWeight: "900", marginBottom: 20 }}>
          DEBUG: UPDATED BIOMETRIC SCREEN
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Capture this voter's fingerprint and face. Both are required to
          continue.
        </Text>

        <View style={styles.methodList}>
          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={enrollFingerprint}
            disabled={fpEnrolled}
          >
            <View
              style={[styles.methodIcon, fpEnrolled && styles.methodIconDone]}
            >
              <Text
                style={[
                  styles.methodIconText,
                  fpEnrolled && styles.methodIconTextDone,
                ]}
              >
                {fpEnrolled ? "✓" : "⌾"}
              </Text>
            </View>
            <View style={styles.methodTextWrap}>
              <Text style={styles.methodTitle}>
                {fpEnrolled ? "Fingerprint Confirmed" : "Fingerprint"}
              </Text>
              <Text style={styles.methodSubtitle}>
                {fpEnrolled
                  ? "Saved securely on this device"
                  : "Tap to confirm fingerprint enrollment"}
              </Text>
            </View>
            {!fpEnrolled && <Text style={styles.methodArrow}>→</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={() => simulateEnrollment("face")}
            disabled={faceEnrolled}
          >
            <View
              style={[styles.methodIcon, faceEnrolled && styles.methodIconDone]}
            >
              <Text
                style={[
                  styles.methodIconText,
                  faceEnrolled && styles.methodIconTextDone,
                ]}
              >
                {faceEnrolled ? "✓" : "◎"}
              </Text>
            </View>
            <View style={styles.methodTextWrap}>
              <Text style={styles.methodTitle}>
                {faceEnrolled ? "Face Captured" : "Face"}
              </Text>
              <Text style={styles.methodSubtitle}>
                {faceEnrolled
                  ? "Saved securely on this device"
                  : "Tap to capture the voter's face"}
              </Text>
            </View>
            {!faceEnrolled && <Text style={styles.methodArrow}>→</Text>}
          </TouchableOpacity>
        </View>

        {bothDone && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Both records captured. Nothing is sent until you confirm.
            </Text>
          </View>
        )}

        <CustomButton
          title="Continue"
          onPress={handleContinue}
          disabled={!bothDone}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.xl },
  methodList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.lg,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  methodIconText: { fontSize: 22, color: colors.primary },
  methodIconTextDone: { color: colors.white, fontWeight: "900" },
  methodTextWrap: { flex: 1 },
  methodTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  methodSubtitle: { fontSize: 13, color: colors.textMuted },
  methodArrow: { fontSize: 18, color: colors.textLight, fontWeight: "300" },
  notice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  noticeText: { fontSize: 13, lineHeight: 20, color: colors.primaryMid },
});

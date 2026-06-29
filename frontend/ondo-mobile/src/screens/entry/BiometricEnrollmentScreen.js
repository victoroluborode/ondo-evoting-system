import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as LocalAuthentication from "expo-local-authentication";
import * as ImagePicker from "expo-image-picker";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

export default function BiometricEnrollmentScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { voterData } = route.params;

  const [fpEnrolled, setFpEnrolled] = useState(false);
  const [faceImageBase64, setFaceImageBase64] = useState(null);

  const faceEnrolled = Boolean(faceImageBase64);
  const bothDone = fpEnrolled && faceEnrolled;

const enrollFingerprint = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (!hasHardware || !isEnrolled) {
    Alert.alert(
      "Fingerprint unavailable",
      "This device does not have fingerprint authentication set up.",
    );
    return;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Confirm fingerprint enrollment",
    cancelLabel: "Cancel",
    disableDeviceFallback: true,
  });

  console.log(result);

  if (result.success) {
    setFpEnrolled(true);
  }
};

  const captureFace = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera permission required",
          "Please allow camera access to capture the voter's face.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.4,
        cameraType: ImagePicker.CameraType.front,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]?.base64) {
        setFaceImageBase64(result.assets[0].base64);
      }
    } catch (error) {
      console.log("Face capture error:", error);
      Alert.alert("Face capture error", "Could not capture face photo.");
    }
  };

  const handleContinue = () => {
    navigation.navigate("SetPassword", {
      voterData: {
        ...voterData,
        fingerprintTemplate: `fp-enrolled-${voterData.vin}`,
        faceImageBase64,
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
        <Text style={[typography.subtitle, styles.subtitle]}>
          Confirm this voter's fingerprint capability and capture their face.
          Both are required to continue.
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
                  ? "Fingerprint authentication confirmed on this device"
                  : "Tap to confirm this device has fingerprint set up"}
              </Text>
            </View>

            {!fpEnrolled && <Text style={styles.methodArrow}>→</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={captureFace}
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
                  ? "Face photo captured for verification"
                  : "Tap to capture the voter's face"}
              </Text>
            </View>

            {!faceEnrolled && <Text style={styles.methodArrow}>→</Text>}
          </TouchableOpacity>
        </View>

        {bothDone && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              Both biometric records are ready. The face photo will be processed
              securely when you finish registration.
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

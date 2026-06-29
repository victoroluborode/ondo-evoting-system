import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

export default function FaceEnrollmentScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { voterData } = route.params;
  const [faceImageBase64, setFaceImageBase64] = useState(null);
  const [capturing, setCapturing] = useState(false);

  const faceEnrolled = Boolean(faceImageBase64);

  const captureFace = async () => {
    try {
      setCapturing(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        setCapturing(false);
        Alert.alert(
          "Camera permission required",
          "Please allow camera access to capture your face.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.4,
        cameraType: ImagePicker.CameraType.front,
        base64: true,
      });

      setCapturing(false);

      if (!result.canceled && result.assets?.[0]?.base64) {
        setFaceImageBase64(result.assets[0].base64);
      }
    } catch (error) {
      setCapturing(false);
      Alert.alert(
        "Face capture error",
        "Could not capture face photo. Please try again.",
      );
    }
  };

  const handleContinue = () => {
    navigation.navigate("SetPassword", {
      voterData: { ...voterData, faceImageBase64 },
    });
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Text style={[typography.h1, styles.title]}>Capture Your Face</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          We'll use this if fingerprint verification doesn't work for you on
          election day.
        </Text>

        <View
          style={[styles.iconCircle, faceEnrolled && styles.iconCircleDone]}
        >
          <Text style={[styles.icon, faceEnrolled && styles.iconDone]}>
            {faceEnrolled ? "✓" : "◎"}
          </Text>
        </View>

        {!faceEnrolled ? (
          <CustomButton
            title="Open Camera"
            onPress={captureFace}
            loading={capturing}
            disabled={capturing}
          />
        ) : (
          <>
            <View style={styles.notice}>
              <Text style={styles.noticeText}>Face photo captured.</Text>
            </View>
            <CustomButton
              title="Retake Photo"
              variant="outline"
              onPress={captureFace}
              style={{ marginTop: spacing.sm }}
            />
          </>
        )}

        <CustomButton
          title="Continue"
          onPress={handleContinue}
          disabled={!faceEnrolled}
          style={{ marginTop: spacing.md }}
        />
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
  iconCircleDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  icon: { fontSize: 36, color: colors.primary },
  iconDone: { color: colors.white, fontWeight: "900" },
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

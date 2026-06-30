import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { saveOfflinePackage } from "../../services/offlineVoteStore";
import { colors, spacing, typography, radius } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

export default function FaceVerificationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData, loginRole, logout } = useContext(AuthContext);
  const [status, setStatus] = useState("idle");
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);
  const { execute } = useNetworkRequest();

  const prefetchOfflinePackage = async ({ token, constituencyId }) => {
    try {
      const offlinePkg = await apiRequest(
        `/votes/offline-package/${constituencyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      await saveOfflinePackage(offlinePkg);
    } catch (err) {
      // Non-fatal — if this fails, the voter can still vote online normally.
      console.warn("Could not pre-fetch offline voting package:", err.message);
    }
  };

  const handleCapture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setStatus("failed");
      setAttemptsRemaining(null);
      return;
    }

    setStatus("capturing");

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) {
      setStatus("idle");
      return;
    }

    await verifyFace(result.assets[0].base64);
  };

  const verifyFace = async (faceImageBase64) => {
    setStatus("verifying");

    const result = await execute(async () => {
      return await apiRequest("/auth/verify-biometric", {
        method: "POST",
        body: JSON.stringify({
          sessionToken: userData.sessionToken,
          method: "face",
          faceImageBase64,
        }),
      });
    });

    if (!result.success) {
      if (result.errorType === "network") {
        setStatus("network");
        return;
      }

      const data = result.error?.data;

      if (data?.locked) {
        setStatus("locked");
        return;
      }

      setAttemptsRemaining(data?.attemptsRemaining ?? null);
      setStatus("failed");
      return;
    }

    const nextUserData = {
      ...userData,
      ...result.data.user,
      token: result.data.token,
      authMethod: result.data.authMethod,
      sessionToken: null,
    };

    loginRole("voter", nextUserData);

    await prefetchOfflinePackage({
      token: result.data.token,
      constituencyId: result.data.user.constituencyId,
    });

    navigation.replace("Ballot");
  };

  if (status === "network") {
    return <NetworkErrorState onRetry={handleCapture} />;
  }

  if (status === "locked") {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.centeredContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={[styles.iconCircle, styles.iconCircleError]}>
            <Ionicons name="close-circle" size={34} color={colors.error} />
          </View>

          <Text style={[typography.h2, styles.centeredTitle]}>
            Face Verification Locked
          </Text>

          <Text style={[typography.subtitle, styles.centeredSubtitle]}>
            Facial recognition has been locked for this session after too many
            unsuccessful attempts. This protects against repeated, unauthorized
            attempts. Please sign out and try again later, or contact support.
          </Text>

          <CustomButton title="Sign Out" onPress={logout} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View
          style={[
            styles.cameraFrame,
            status === "failed" && styles.cameraFrameError,
          ]}
        >
          {status === "verifying" ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Ionicons
              name={status === "failed" ? "close-circle" : "scan-outline"}
              size={status === "failed" ? 38 : 46}
              color={status === "failed" ? colors.error : colors.primary}
            />
          )}
        </View>

        {(status === "idle" || status === "capturing") && (
          <>
            <Text style={[typography.h2, styles.centeredTitle]}>
              Face Verification
            </Text>
            <Text style={[typography.subtitle, styles.centeredSubtitle]}>
              We'll open your camera. Position your face inside the frame, look
              straight ahead, and hold still.
            </Text>
            <CustomButton
              title="Open Camera"
              onPress={handleCapture}
              loading={status === "capturing"}
              disabled={status === "capturing"}
            />
          </>
        )}

        {status === "verifying" && (
          <Text style={styles.scanningStatus}>Verifying your face…</Text>
        )}

        {status === "failed" && (
          <>
            <Text style={[typography.h2, styles.centeredTitle]}>
              Face Did Not Match
            </Text>
            <Text style={[typography.subtitle, styles.centeredSubtitle]}>
              We couldn't confirm a match with your enrolled face.
            </Text>

            <View style={styles.helpCard}>
              <Text style={styles.helpTitle}>Try this</Text>

              <View style={styles.helpItem}>
                <Text style={styles.helpBullet}>•</Text>
                <Text style={styles.helpText}>Move to a well-lit area</Text>
              </View>

              <View style={styles.helpItem}>
                <Text style={styles.helpBullet}>•</Text>
                <Text style={styles.helpText}>
                  Remove glasses, hats, or anything covering your face
                </Text>
              </View>

              <View style={styles.helpItem}>
                <Text style={styles.helpBullet}>•</Text>
                <Text style={styles.helpText}>
                  Hold the phone at eye level, about an arm's length away
                </Text>
              </View>
            </View>

            {attemptsRemaining !== null && (
              <View style={styles.attemptRow}>
                <Text style={styles.attemptText}>
                  {attemptsRemaining} attempt
                  {attemptsRemaining === 1 ? "" : "s"} remaining
                </Text>
              </View>
            )}

            <CustomButton title="Try Again" onPress={handleCapture} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  centeredContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraFrame: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    marginBottom: spacing.lg,
  },
  cameraFrameError: { backgroundColor: "#FDECEB", borderColor: "#E8C0BC" },
  cameraIcon: { fontSize: 44, color: colors.primary },
  cameraIconError: { fontSize: 32, color: colors.error },
  centeredTitle: { textAlign: "center", marginBottom: spacing.sm },
  centeredSubtitle: {
    textAlign: "center",
    marginBottom: spacing.lg,
    maxWidth: 280,
  },
  scanningStatus: { fontSize: 13, fontWeight: "700", color: colors.primary },
  helpCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  helpTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  helpItem: { flexDirection: "row", gap: 8, marginBottom: 6 },
  helpBullet: { fontSize: 13, color: colors.primary, fontWeight: "900" },
  helpText: { fontSize: 13, color: colors.textMid, flex: 1, lineHeight: 19 },
  attemptRow: {
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F0DDA0",
  },
  attemptText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.warning,
    textAlign: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryDim,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  iconCircleError: { backgroundColor: "#FDECEB", borderColor: "#E8C0BC" },
  iconError: { fontSize: 28, color: colors.error, fontWeight: "900" },
});

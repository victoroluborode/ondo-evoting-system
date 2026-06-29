import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { colors, spacing, typography, radius } from "../../theme";

const MIN_PASSWORD_LENGTH = 8; // Must match backend MIN_PASSWORD_LENGTH.

export default function SetVoterPasswordScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const { voterData } = route.params;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState(null);
  const { execute, loading, error, errorType, clearError } =
    useNetworkRequest();

  const handleFinalize = async () => {
    setLocalError(null);
    clearError();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setLocalError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match. Please re-enter both fields.");
      return;
    }

    const result = await execute(async () => {
      return await apiRequest("/auth/register-voter", {
        method: "POST",
        headers: { Authorization: `Bearer ${userData.token}` },
        body: JSON.stringify({
          vin: voterData.vin,
          fullName: voterData.fullName,
          email: voterData.email,
          phoneNumber: voterData.phoneNumber,
          password,
          constituencyId: voterData.constituencyId,
          lgaId: voterData.lgaId,
          fingerprintTemplate: voterData.fingerprintTemplate,
          faceTemplate: voterData.faceTemplate,
        }),
      });
    });

    if (!result.success) return;

    navigation.replace("Success", { voterData: result.data.voter });
  };

  if (errorType === "network") {
    return <NetworkErrorState onRetry={handleFinalize} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Set Voter Password</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Hand the device to the voter to enter their own password.
        </Text>

        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Private step</Text>
          <Text style={styles.noticeText}>
            You should not see or know this password. Step away if needed.
          </Text>
        </View>

        {(localError || error) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        )}

        <CustomInput
          label="New Password"
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setLocalError(null);
            clearError();
          }}
        />
        <CustomInput
          label="Confirm Password"
          placeholder="Voter re-enters password"
          secureTextEntry
          value={confirm}
          onChangeText={(text) => {
            setConfirm(text);
            setLocalError(null);
            clearError();
          }}
        />

        <CustomButton
          title="Complete Registration"
          onPress={handleFinalize}
          loading={loading}
          disabled={!password || !confirm || loading}
          style={{ marginTop: spacing.sm }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  notice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMid,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noticeText: { fontSize: 13, lineHeight: 20, color: colors.textMid },
  errorBanner: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "#FDECEB",
    borderWidth: 1,
    borderColor: "#E8C0BC",
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.error,
    lineHeight: 19,
  },
});

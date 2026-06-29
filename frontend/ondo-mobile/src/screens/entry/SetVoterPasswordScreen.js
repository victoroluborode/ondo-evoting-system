import React, { useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography, radius } from "../../theme";

const MIN_PASSWORD_LENGTH = 8;

export default function SetVoterPasswordScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { voterData } = route.params;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [completed, setCompleted] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { execute, loading, error, errorType, clearError } =
    useNetworkRequest();

  const handleFinalize = async () => {
    if (loading || completed) return;

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

    const registerResult = await execute(async () => {
      return await apiRequest("/auth/register-voter", {
        method: "POST",
        body: JSON.stringify({
          vin: voterData.vin,
          fullName: voterData.fullName,
          email: voterData.email,
          phoneNumber: voterData.phoneNumber,
          password,
          constituencyId: voterData.constituencyId,
          lgaId: voterData.lgaId,
          fingerprintTemplate: voterData.fingerprintTemplate,
          faceImageBase64: voterData.faceImageBase64,
        }),
      });
    });

    if (!registerResult.success) return;

    setCompleted(true);
  };

  if (errorType === "network" && !completed) {
    return <NetworkErrorState onRetry={handleFinalize} />;
  }

  if (completed) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.successContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={styles.successIconCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={[typography.h1, styles.successTitle]}>
            Registration Complete
          </Text>
          <Text style={[typography.subtitle, styles.successSubtitle]}>
            Your voter account has been registered successfully. Your
            registration is now pending review by an election administrator.
            You'll be able to sign in once your registration is approved.
          </Text>
          {/* replace the completed block's content/button entirely with: */}
          <CustomButton
            title="Continue"
            onPress={() => navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: "RegistrationPending"}],
              }))
            }
          />
        </View>
      </View>
    );
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
        <Text style={[typography.h1, styles.title]}>Create Your Password</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          You'll use this with your VIN or email to sign in next time.
        </Text>

        {(localError || error) && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        )}

        <CustomInput
          label="Password"
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
          placeholder="Re-enter your password"
          secureTextEntry
          value={confirm}
          onChangeText={(text) => {
            setConfirm(text);
            setLocalError(null);
            clearError();
          }}
        />

        <CustomButton
          title="Finish Registration"
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
  successContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  successIconCircle: {
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
  successIcon: {
    fontSize: 30,
    color: colors.primary,
    fontWeight: "900",
  },
  successTitle: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});

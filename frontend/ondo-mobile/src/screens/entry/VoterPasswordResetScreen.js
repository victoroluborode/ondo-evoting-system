// VoterPasswordResetScreen.js — rebuilt with both recovery paths
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography, radius } from "../../theme";

const METHODS = { EMAIL: "email", SMS: "sms" };

export default function VoterPasswordResetScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState(METHODS.EMAIL);
  const [identifier, setIdentifier] = useState(""); // VIN or email, for email path
  const [vin, setVin] = useState(""); // for SMS path, VIN only (SMS goes to the phone on file)
  const [step, setStep] = useState("request"); // request | otpEntry | sent
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { execute, loading, error, clearError } = useNetworkRequest();

  const handleEmailRequest = async () => {
    const result = await execute(async () => {
      return await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
    });
    if (result.success) setStep("sent");
  };

  const handleSmsRequest = async () => {
    const result = await execute(async () => {
      return await apiRequest("/auth/request-password-otp", {
        method: "POST",
        body: JSON.stringify({ vin: vin.trim() }),
      });
    });
    if (result.success) setStep("otpEntry");
  };

  const handleSmsReset = async () => {
    if (newPassword !== confirmPassword) {
      return; // basic guard; could add a local error state here too
    }
    const result = await execute(async () => {
      return await apiRequest("/auth/reset-password-otp", {
        method: "POST",
        body: JSON.stringify({
          vin: vin.trim(),
          otp: otp.trim(),
          password: newPassword,
        }),
      });
    });
    if (result.success) setStep("done");
  };

  if (step === "sent") {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.centerContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✉</Text>
          </View>
          <Text style={[typography.h1, styles.title]}>Check Your Email</Text>
          <Text style={[typography.subtitle, styles.subtitle]}>
            If an account matches what you entered, we've sent password reset
            instructions to the email on file.
          </Text>
          <CustomButton
            title="Back to Sign In"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  if (step === "done") {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.centerContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✓</Text>
          </View>
          <Text style={[typography.h1, styles.title]}>Password Reset</Text>
          <Text style={[typography.subtitle, styles.subtitle]}>
            Your password has been updated. Sign in with your new password.
          </Text>
          <CustomButton
            title="Back to Sign In"
            onPress={() => navigation.goBack()}
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
        <Text style={[typography.h1, styles.title]}>Reset Password</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Choose how you'd like to receive your reset instructions.
        </Text>

        <View style={styles.methodTabs}>
          <TouchableOpacity
            style={[
              styles.methodTab,
              method === METHODS.EMAIL && styles.methodTabActive,
            ]}
            onPress={() => {
              setMethod(METHODS.EMAIL);
              clearError();
            }}
          >
            <Text
              style={[
                styles.methodTabText,
                method === METHODS.EMAIL && styles.methodTabTextActive,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodTab,
              method === METHODS.SMS && styles.methodTabActive,
            ]}
            onPress={() => {
              setMethod(METHODS.SMS);
              clearError();
            }}
          >
            <Text
              style={[
                styles.methodTabText,
                method === METHODS.SMS && styles.methodTabTextActive,
              ]}
            >
              Phone (SMS)
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {method === METHODS.EMAIL && (
          <>
            <Text style={styles.helperText}>
              We'll email you a secure link to set a new password.
            </Text>
            <CustomInput
              label="VIN or Email Address"
              placeholder="Enter your VIN or email"
              autoCapitalize="none"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                clearError();
              }}
            />
            <CustomButton
              title="Send Reset Email"
              onPress={handleEmailRequest}
              loading={loading}
              disabled={!identifier.trim() || loading}
            />
          </>
        )}

        {method === METHODS.SMS && step === "request" && (
          <>
            <Text style={styles.helperText}>
              No email on file? We'll send a 6-digit code by SMS to the phone
              number on your registration instead.
            </Text>
            <CustomInput
              label="Voter Identification Number (VIN)"
              placeholder="Enter your VIN"
              autoCapitalize="characters"
              value={vin}
              onChangeText={(text) => {
                setVin(text);
                clearError();
              }}
            />
            <CustomButton
              title="Send SMS Code"
              onPress={handleSmsRequest}
              loading={loading}
              disabled={!vin.trim() || loading}
            />
          </>
        )}

        {method === METHODS.SMS && step === "otpEntry" && (
          <>
            <Text style={styles.helperText}>
              Enter the 6-digit code sent to your phone, along with your new
              password.
            </Text>
            <CustomInput
              label="SMS Code"
              placeholder="6-digit code"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, ""));
                clearError();
              }}
            />
            <CustomInput
              label="New Password"
              placeholder="At least 8 characters"
              secureTextEntry
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text);
                clearError();
              }}
            />
            <CustomInput
              label="Confirm New Password"
              placeholder="Re-enter new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearError();
              }}
            />
            <CustomButton
              title="Reset Password"
              onPress={handleSmsReset}
              loading={loading}
              disabled={
                otp.length !== 6 ||
                !newPassword ||
                newPassword !== confirmPassword ||
                loading
              }
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  centerContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  methodTabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  methodTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  methodTabActive: { backgroundColor: colors.primary },
  methodTabText: { fontSize: 13, fontWeight: "700", color: colors.textMid },
  methodTabTextActive: { color: colors.white },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: spacing.md,
  },
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
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryDim,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 28, color: colors.primary, fontWeight: "900" },
});

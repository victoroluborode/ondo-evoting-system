import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography, radius } from "../../theme";

export default function AdminLoginScreen() {
  const insets = useSafeAreaInsets();
  const { loginRole } = useContext(AuthContext);
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState(null);
  const { execute, loading, error, clearError } = useNetworkRequest();

  const handleLogin = async () => {
    const result = await execute(async () => {
      return await apiRequest("/admin/login", {
        method: "POST",
        body: JSON.stringify({ identifier: adminId.trim(), password }),
      });
    });

    if (result.success) {
      setPendingToken(result.data.pendingToken);
      setMaskedEmail(result.data.maskedEmail);
      setOtpStep(true);
    }
  };

  const handleVerifyOtp = async () => {
    const result = await execute(async () => {
      return await apiRequest("/admin/verify-otp", {
        method: "POST",
        body: JSON.stringify({ pendingToken, otp: otp.trim() }),
      });
    });

    if (result.success) {
      loginRole(
        "admin",
        result.data.user
          ? { ...result.data.user, token: result.data.token }
          : { token: result.data.token },
      );
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl, flexGrow: 1 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {!otpStep ? (
            <>
              <View style={styles.brandBlock}>
                <View style={styles.coatMark}>
                  <Image
                    source={require("../../assets/nigeria-coat-of-arms.png")}
                    style={styles.coatOfArms}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.brandName}>ONDO e-VOTE</Text>
                <Text style={styles.brandTagline}>
                  Federal Republic of Nigeria
                </Text>
              </View>

              <View style={styles.headerRow}>
                <Text style={typography.label}>Admin Portal</Text>
                <View style={[styles.chip, styles.chipDark]}>
                  <Text style={[styles.chipText, styles.chipTextDark]}>
                    Admin
                  </Text>
                </View>
              </View>

              <Text style={[typography.h1, styles.title]}>Admin access</Text>
              <Text style={[typography.subtitle, styles.subtitle]}>
                We'll send a verification code to your email after your password
                is confirmed.
              </Text>

              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <CustomInput
                label="Admin ID / Username"
                placeholder="e.g. ADM-ONDO-001"
                autoCapitalize="characters"
                value={adminId}
                onChangeText={(text) => {
                  setAdminId(text);
                  clearError();
                }}
              />
              <CustomInput
                label="Password"
                placeholder="Enter secure password"
                secureTextEntry
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError();
                }}
              />

              <CustomButton
                title="Continue"
                onPress={handleLogin}
                loading={loading}
                disabled={!adminId || !password || loading}
              />
            </>
          ) : (
            <View style={styles.otpWrap}>
              <View style={styles.otpIconCircle}>
                <Text style={styles.otpIcon}>✉</Text>
              </View>
              <Text style={[typography.h2, styles.otpTitle]}>
                Check Your Email
              </Text>
              <Text style={[typography.subtitle, styles.otpSubtitle]}>
                We sent a 6-digit code to {maskedEmail || "your email"}.
              </Text>

              {error && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <CustomInput
                label="Verification Code"
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/[^0-9]/g, ""));
                  clearError();
                }}
                style={{ width: "100%" }}
              />

              <CustomButton
                title="Verify & Sign In"
                onPress={handleVerifyOtp}
                loading={loading}
                disabled={otp.length !== 6 || loading}
                style={{ width: "100%", marginTop: spacing.sm }}
              />

              <CustomButton
                title="Back to Login"
                variant="outline"
                onPress={() => {
                  setOtpStep(false);
                  setOtp("");
                  setPendingToken(null);
                }}
                style={{ width: "100%", marginTop: spacing.sm }}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  chip: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  chipDark: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  chipTextDark: { color: colors.white },
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
  otpWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: spacing.lg,
    width: "100%",
  },
  otpIconCircle: {
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
  otpIcon: { fontSize: 30, color: colors.primary },
  otpTitle: { textAlign: "center", marginBottom: spacing.xs },
  otpSubtitle: { textAlign: "center", marginBottom: spacing.lg, maxWidth: 280 },
  brandBlock: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },

  coatMark: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  coatOfArms: {
    width: 58,
    height: 58,
  },

  brandName: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 2,
  },

  brandTagline: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

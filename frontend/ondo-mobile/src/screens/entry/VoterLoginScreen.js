import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography, radius } from "../../theme";

export default function VoterLoginScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { loginRole } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const { execute, loading, error, clearError } = useNetworkRequest();

  // inside handleLogin, replace the existing execute() call's structure:

  const handleLogin = () => {
    execute(async () => {
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      loginRole("voter", {
        ...data.user,
        sessionToken: data.sessionToken,
        biometricEnrollment: data.biometricEnrollment,
        sessionExpiresInSeconds: data.expiresInSeconds,
      });
    }).then((result) => {
      if (
        !result.success &&
        result.error?.message === "Voter has already voted"
      ) {
        navigation.navigate("AlreadyVoted");
      }
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <View style={styles.coatMark}>
              <Image
                source={require("../../assets/nigeria-coat-of-arms.png")}
                style={styles.coatOfArms}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.brandName}>ONDO e-VOTE</Text>
            <Text style={styles.brandTagline}>Federal Republic of Nigeria</Text>
          </View>
          <Text style={[typography.h1, styles.title]}>Welcome back</Text>
          <Text style={[typography.subtitle, styles.subtitle]}>
            Sign in with your VIN or email to continue.
          </Text>
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
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
          <CustomInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError();
            }}
          />
          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={!identifier || !password || loading}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate("VoterPasswordReset")}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            onPress={() => navigation.navigate("VoterRegister")}
            style={styles.registerRow}
            activeOpacity={0.7}
          >
            <Text style={styles.registerText}>
              Don't have an account?{" "}
              <Text style={styles.registerTextBold}>Register here</Text>
            </Text>
          </TouchableOpacity>
          <CustomButton
            title="Admin Portal"
            variant="outline"
            onPress={() => navigation.navigate("AdminLogin")}
            style={{ marginTop: spacing.lg }}
          />
          <CustomButton
            title="Verify a Vote Receipt"
            variant="outline"
            onPress={() => navigation.navigate("ReceiptVerification")}
            style={{ marginTop: spacing.sm }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    flexGrow: 1,
  },
  brandBlock: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
    gap: 5,
  },
  logoLine: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  logoLineShort: {
    width: 14,
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
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
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
  linkRow: {
    alignSelf: "center",
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMid,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  registerRow: {
    alignSelf: "center",
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  registerText: {
    fontSize: 14,
    color: colors.textMid,
  },
  registerTextBold: {
    fontWeight: "800",
    color: colors.primary,
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
});

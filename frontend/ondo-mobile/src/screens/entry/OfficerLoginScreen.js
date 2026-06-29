import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";
import { apiRequest } from "../../services/api";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";

export default function OfficerLoginScreen() {
  const insets = useSafeAreaInsets();
  const { loginRole } = useContext(AuthContext);
  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const { execute, loading, error, clearError } = useNetworkRequest();

  const handleLogin = () => {
    execute(async () => {
      const data = await apiRequest("/auth/officers/login", {
        method: "POST",
        body: JSON.stringify({
          identifier: officerId.trim(),
          password,
        }),
      });

      loginRole("officer", {
        ...data.user,
        token: data.token,
      });
    });
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
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Text style={typography.label}>Officer Portal</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Officer</Text>
            </View>
          </View>

          <Text style={[typography.h1, styles.title]}>Electoral Officer</Text>
          <Text style={[typography.subtitle, styles.subtitle]}>
            Enter your authorised Officer ID and passcode to access the
            registration dashboard.
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <CustomInput
            label="Officer ID"
            placeholder="e.g. OFF-1002"
            autoCapitalize="characters"
            value={officerId}
            onChangeText={(text) => {
              setOfficerId(text);
              clearError();
            }}
          />

          <CustomInput
            label="Passcode"
            placeholder="Enter secure passcode"
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError();
            }}
          />

          <CustomButton
            title="Secure Login"
            onPress={handleLogin}
            loading={loading}
            disabled={!officerId || !password || loading}
          />

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Reminder</Text>
            <Text style={styles.noticeText}>
              Officer credentials are issued per polling unit. Contact your
              constituency coordinator if you've lost access.
            </Text>
          </View>
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
  },
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
  chipText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
  notice: {
    marginTop: spacing.md,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMid,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMid,
  },
});

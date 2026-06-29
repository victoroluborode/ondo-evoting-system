import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";
import { apiRequest } from "../../services/api";

export default function VoterPasswordResetScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({
          identifier: identifier.trim(),
        }),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View
          style={[
            styles.confirmContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✓</Text>
          </View>
          <Text style={[typography.h1, styles.confirmTitle]}>
            Check Your Email
          </Text>
          <Text style={[typography.subtitle, styles.confirmSubtitle]}>
            If an account matches {identifier || "the details you entered"},
            we've sent instructions to reset your password.
          </Text>
          <CustomButton
            title="Back to Login"
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
          Enter your Voter Identification Number or email and we'll send you
          instructions to reset your password.
        </Text>

        <CustomInput
          label="VIN or Email Address"
          placeholder="Enter your VIN or email"
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
        />

        <CustomButton
          title="Send Reset Instructions"
          onPress={handleSubmit}
          loading={loading}
          disabled={!identifier}
        />
      </ScrollView>
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
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.lg,
  },
  confirmContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: "center",
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
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  icon: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900",
  },
  confirmTitle: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  confirmSubtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
  },
});

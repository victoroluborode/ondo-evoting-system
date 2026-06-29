import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography, radius } from "../../theme";

export default function ReceiptVerificationScreen() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const { execute, loading, errorType, clearError } = useNetworkRequest();

  const handleVerify = async () => {
    setResult(null);
    clearError();

    const trimmed = code.trim();
    const outcome = await execute(async () => {
      return await apiRequest(`/votes/verify-receipt/${trimmed}`);
    });

    if (outcome.success) {
      setResult({ found: true, castAt: outcome.data.castAt });
    } else if (outcome.errorType !== "network") {
      setResult({ found: false });
    }
  };

  if (errorType === "network") {
    return <NetworkErrorState onRetry={handleVerify} />;
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
        <Text style={[typography.h1, styles.title]}>Verify a Receipt</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Enter a vote receipt code to confirm it was recorded. No sign-in
          required — this does not reveal who the vote was for.
        </Text>

        <CustomInput
          label="Receipt Code"
          placeholder="Paste or enter the receipt code"
          autoCapitalize="none"
          autoCorrect={false}
          value={code}
          onChangeText={(text) => {
            setCode(text);
            setResult(null);
            clearError();
          }}
        />

        <CustomButton
          title="Verify Receipt"
          onPress={handleVerify}
          loading={loading}
          disabled={!code.trim() || loading}
        />

        {result && (
          <View
            style={[
              styles.resultBox,
              result.found ? styles.resultSuccess : styles.resultError,
            ]}
          >
            <Text
              style={[
                styles.resultText,
                result.found
                  ? styles.resultTextSuccess
                  : styles.resultTextError,
              ]}
            >
              {result.found
                ? `Confirmed — a vote matching this receipt was recorded on ${new Date(result.castAt).toLocaleString()}.`
                : "No vote was found matching this receipt code. Double-check the code and try again."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  resultBox: {
    padding: spacing.base,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  resultSuccess: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  resultError: {
    backgroundColor: "#FDECEB",
    borderWidth: 1,
    borderColor: "#E8C0BC",
  },
  resultText: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  resultTextSuccess: { color: colors.primaryMid },
  resultTextError: { color: colors.error },
});

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography } from "../../theme";

export default function VoterRegisterScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [vin, setVin] = useState("");
  const { execute, loading, error, errorType, clearError } =
    useNetworkRequest();

  const handleCheck = async () => {
    const result = await execute(async () => {
      return await apiRequest("/auth/validate-vin", {
        method: "POST",
        body: JSON.stringify({ vin: vin.trim() }),
      });
    });

    if (!result.success) return;

    const data = result.data;

    if (data.alreadyRegistered) {
      navigation.navigate("AlreadyRegistered", {
        fullName: data.fullName,
        vin: data.vin,
      });
      return;
    }

    navigation.navigate("ConfirmVoterDetails", {
      voterData: {
        vin: data.vin,
        fullName: data.fullName,
        lgaId: data.lgaId,
        constituencyId: data.constituencyId,
      },
    });
  };

  if (errorType === "network") {
    return <NetworkErrorState onRetry={handleCheck} />;
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
        <Text style={[typography.h1, styles.title]}>Verify Your VIN</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Enter your Voter Identification Number to check your eligibility and
          begin registration.
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <CustomInput
          label="Voter Identification Number (VIN)"
          placeholder="e.g. VIN001001"
          autoCapitalize="characters"
          value={vin}
          onChangeText={(text) => {
            setVin(text);
            clearError();
          }}
        />

        <CustomButton
          title="Check My VIN"
          onPress={handleCheck}
          loading={loading}
          disabled={!vin.trim() || loading}
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
    borderRadius: 12,
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

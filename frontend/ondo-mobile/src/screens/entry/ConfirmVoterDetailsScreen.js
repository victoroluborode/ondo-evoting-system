import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

export default function ConfirmVoterDetailsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { voterData } = route.params;
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleNext = () => {
    navigation.navigate("Biometrics", {
      voterData: {
        ...voterData,
        email: email.trim() || null,
        phoneNumber: phone ? `+234${phone}` : null,
      },
    });
  };

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
        <Text style={[typography.h1, styles.title]}>Confirm Your Details</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          These details come from the official voter register and cannot be
          changed here.
        </Text>

        <View style={styles.readonlyCard}>
          <View style={styles.readonlyRow}>
            <Text style={styles.readonlyLabel}>Full Name</Text>
            <Text style={styles.readonlyValue}>{voterData.fullName}</Text>
          </View>
          <View style={[styles.readonlyRow, styles.readonlyRowLast]}>
            <Text style={styles.readonlyLabel}>VIN</Text>
            <Text style={styles.readonlyValue}>{voterData.vin}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Contact Information</Text>

        <CustomInput
          label="Email Address (optional)"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.phoneWrap}>
          <Text style={typography.label}>Phone Number (optional)</Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+234</Text>
            </View>
            <View style={styles.phoneField}>
              <CustomInput
                placeholder="8012345678"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
              />
            </View>
          </View>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Add at least one so you can reset your password later if needed.
          </Text>
        </View>

        <CustomButton title="Continue to Biometrics" onPress={handleNext} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  readonlyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  readonlyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  readonlyRowLast: { borderBottomWidth: 0 },
  readonlyLabel: { fontSize: 13, color: colors.textMuted },
  readonlyValue: { fontSize: 13, fontWeight: "800", color: colors.text },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  phoneWrap: { marginBottom: spacing.ml },
  phoneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginTop: spacing.xxs + 2,
  },
  phonePrefix: {
    height: 52,
    paddingHorizontal: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  phonePrefixText: { fontSize: 16, fontWeight: "700", color: colors.textMid },
  phoneField: { flex: 1 },
  notice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  noticeText: { fontSize: 13, lineHeight: 20, color: colors.textMid },
});

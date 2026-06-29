import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

export default function RegistrationSuccessScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { voterData } = route.params || {};

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={[typography.h1, styles.title]}>Voter Registered</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          The voter's information has been saved successfully.
        </Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Name</Text>
            <Text style={styles.summaryValue}>
              {voterData?.full_name || "—"}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowLast]}>
            <Text style={styles.summaryLabel}>VIN</Text>
            <Text style={styles.summaryValue}>{voterData?.vin || "—"}</Text>
          </View>
        </View>

        <CustomButton
          title="Register Next Voter"
          onPress={() => navigation.navigate("VinCheck")}
        />
        <CustomButton
          title="Return to Dashboard"
          variant="outline"
          onPress={() => navigation.navigate("Dashboard")}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: "center" },
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
  icon: { color: colors.primary, fontSize: 28, fontWeight: "900" },
  title: { textAlign: "center", marginBottom: spacing.sm },
  subtitle: { textAlign: "center", marginBottom: spacing.xl },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryRowLast: { borderBottomWidth: 0 },
  summaryLabel: { fontSize: 13, color: colors.textMuted },
  summaryValue: { fontSize: 13, fontWeight: "800", color: colors.text },
});

import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

export default function OfficialReportScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { results } = route.params;
  const [generated, setGenerated] = useState(false);

  const totalTurnout = results.reduce((sum, r) => sum + r.turnout, 0);
  const generatedAt = new Date().toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>
          Official Election Report
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Combined results across all {results.length} Federal Constituencies of
          Ondo State.
        </Text>

        <View style={styles.statHero}>
          <Text style={styles.statLabel}>Total Votes Cast</Text>
          <Text style={styles.statValue}>{totalTurnout.toLocaleString()}</Text>
          <Text style={styles.statFootnote}>Compiled {generatedAt}</Text>
        </View>

        <Text style={styles.sectionLabel}>Constituency Summary</Text>
        <View style={styles.summaryCard}>
          {results.map((r, index) => (
            <View
              key={r.constituency}
              style={[
                styles.summaryRow,
                index === results.length - 1 && styles.summaryRowLast,
              ]}
            >
              <Text style={styles.summaryLabel}>{r.constituency}</Text>
              <Text style={styles.summaryValue}>
                {r.turnout.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        <CustomButton
          title={generated ? "Report Saved" : "Save & Finalize Report"}
          onPress={() => setGenerated(true)}
          disabled={generated}
          style={{ marginTop: spacing.lg }}
        />
        {generated && (
          <Text style={styles.confirmText}>
            This report is now final and available for download.
          </Text>
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
  statHero: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primaryBorder,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 44,
    fontWeight: "900",
    color: colors.white,
    marginTop: 4,
  },
  statFootnote: { fontSize: 12, color: colors.primaryBorder, marginTop: 6 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  summaryCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  summaryRowLast: { borderBottomWidth: 0 },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMid,
    flex: 1,
    marginRight: spacing.sm,
  },
  summaryValue: { fontSize: 13, fontWeight: "800", color: colors.primary },
  confirmText: {
    textAlign: "center",
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

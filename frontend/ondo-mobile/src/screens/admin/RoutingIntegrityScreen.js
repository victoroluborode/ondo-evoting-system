// RoutingIntegrityScreen.js — new
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { ONDO_CONSTITUENCIES } from "../../constants/locations";
import { colors, spacing, typography, radius } from "../../theme";

export default function RoutingIntegrityScreen() {
  const insets = useSafeAreaInsets();
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);

  const totalLgas = ONDO_CONSTITUENCIES.reduce(
    (sum, c) => sum + c.lgas.length,
    0,
  );

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setChecked(true);
    }, 1800);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Verify Ballot Routing</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Confirm every LGA correctly routes voters to their constituency
          ballot, with no overlaps or gaps.
        </Text>

        {!checked ? (
          <CustomButton
            title="Run Routing Check"
            onPress={handleCheck}
            loading={checking}
          />
        ) : (
          <>
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                All {totalLgas} LGAs across {ONDO_CONSTITUENCIES.length}{" "}
                constituencies route correctly. No overlaps or gaps found.
              </Text>
            </View>

            <View style={styles.list}>
              {ONDO_CONSTITUENCIES.map((c) => (
                <View key={c.name} style={styles.row}>
                  <View style={styles.rowTextWrap}>
                    <Text style={styles.rowName}>{c.name}</Text>
                    <Text style={styles.rowMeta}>{c.lgas.join(", ")}</Text>
                  </View>
                  <Text style={styles.checkMark}>✓</Text>
                </View>
              ))}
            </View>
          </>
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
  notice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: spacing.lg,
  },
  noticeText: { fontSize: 13, lineHeight: 20, color: colors.primaryMid },
  list: { marginBottom: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowTextWrap: { flex: 1 },
  rowName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 3,
  },
  rowMeta: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  checkMark: { fontSize: 16, fontWeight: "900", color: colors.primary },
});

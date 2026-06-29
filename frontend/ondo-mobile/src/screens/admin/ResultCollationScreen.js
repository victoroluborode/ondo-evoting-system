import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography, radius } from "../../theme";

export default function ResultCollationScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);

  const [constituencies, setConstituencies] = useState(null);
  const [summary, setSummary] = useState(null);

  const { execute, loading, errorType } = useNetworkRequest();

  useEffect(() => {
    loadConstituencies();
  }, []);

  const loadConstituencies = async () => {
    const result = await execute(async () => {
      const [constituenciesRes, dashboardRes] = await Promise.all([
        adminRequest("/admin/constituencies", userData.token),
        adminRequest("/admin/dashboard", userData.token),
      ]);

      return {
        constituenciesRes,
        dashboardRes,
      };
    });

    if (result.success) {
      setConstituencies(result.data.constituenciesRes.constituencies);

      const reportingCount = result.data.dashboardRes.constituencies.filter(
        (c) => c.votesCast > 0,
      ).length;

      setSummary({
        totalVotesCast: result.data.dashboardRes.summary.votesCast,
        reportingCount,
        totalConstituencies: result.data.dashboardRes.constituencies.length,
      });
    }
  };

  if (errorType === "network" && !constituencies) {
    return <NetworkErrorState onRetry={loadConstituencies} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Result Collation</Text>

        <Text style={[typography.subtitle, styles.subtitle]}>
          Select a constituency to view its candidate-level results.
        </Text>

        {summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {summary.totalVotesCast.toLocaleString()}
              </Text>
              <Text style={styles.summaryLabel}>Total Votes Recorded</Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryStat}>
              <Text style={styles.summaryValue}>
                {summary.reportingCount}/{summary.totalConstituencies}
              </Text>
              <Text style={styles.summaryLabel}>Constituencies Reporting</Text>
            </View>
          </View>
        )}

        {loading && !constituencies && (
          <Text style={styles.loadingText}>Loading constituencies…</Text>
        )}

        {constituencies && (
          <View style={styles.list}>
            {constituencies.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.row}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("ConstituencyResult", {
                    constituencyId: c.id,
                    constituencyName: c.name,
                  })
                }
              >
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowName}>{c.name}</Text>
                  <Text style={styles.rowMeta}>{c.code}</Text>
                </View>

                <Text style={styles.rowArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
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

  summaryCard: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },

  summaryStat: {
    flex: 1,
    alignItems: "center",
  },

  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: spacing.md,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.white,
    marginBottom: 4,
  },

  summaryLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },

  list: {
    marginTop: spacing.xs,
  },

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

  rowTextWrap: {
    flex: 1,
  },

  rowName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },

  rowMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },

  rowArrow: {
    fontSize: 16,
    color: colors.textLight,
    fontWeight: "300",
  },
});

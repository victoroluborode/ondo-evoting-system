import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography, radius } from "../../theme";

export default function AdminDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData, logout } = useContext(AuthContext);
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { execute, loading, errorType } = useNetworkRequest();
  const [election, setElection] = useState(null);

  const loadDashboard = useCallback(async () => {
    const result = await execute(async () => {
      const [dashboardRes, electionRes] = await Promise.all([
        adminRequest("/admin/dashboard", userData.token),
        adminRequest("/admin/election", userData.token),
      ]);

      return { dashboardRes, electionRes };
    });

    if (result.success) {
      setDashboard(result.data.dashboardRes);
      setElection(result.data.electionRes.election);
    }
  }, [userData.token]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const modules = [
    {
      title: "Result Collation",
      sub: "View results by constituency",
      route: "ResultCollation",
    },
    {
      title: "Pending Voters",
      sub: "Review and approve new registrations",
      route: "PendingVoters",
    },
    {
      title: "Voter Management",
      sub: "Verify records and detect duplicates",
      route: "VoterManagement",
    },
    {
      title: "Election Management",
      sub: "Configure settings and candidates",
      route: "ElectionMgmt",
    },
    {
      title: "Constituency Management",
      sub: "Manage constituencies and LGAs",
      route: "ConstituencyManagement",
    },
    {
      title: "Audit & Security",
      sub: "View logs and backup records",
      route: "AuditSecurity",
    },
  ];

  if (errorType === "network" && !dashboard) {
    return <NetworkErrorState onRetry={loadDashboard} />;
  }

  const shouldShowElectionStats =
    election && ["open", "closed", "published"].includes(election.status);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={[typography.h1, styles.title]}>State Overview</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Live registration and turnout figures across Ondo State.
        </Text>

        {dashboard && shouldShowElectionStats && (
          <View style={styles.statRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>
                {dashboard.summary.registeredVoters.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Registered Voters</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>
                {dashboard.summary.votesCast.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Votes Cast</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>
                {dashboard.summary.turnoutPercentage}%
              </Text>
              <Text style={styles.statLabel}>Turnout</Text>
            </View>
          </View>
        )}

        {dashboard && shouldShowElectionStats && (
          <>
            <Text style={styles.sectionLabel}>By Constituency</Text>
            <View style={styles.constituencyList}>
              {dashboard.constituencies.map((c) => (
                <View key={c.id} style={styles.constituencyRow}>
                  <View style={styles.constituencyTextWrap}>
                    <Text style={styles.constituencyName}>{c.name}</Text>
                    <Text style={styles.constituencyMeta}>
                      {c.votesCast.toLocaleString()} /{" "}
                      {c.registeredVoters.toLocaleString()} voted
                    </Text>
                  </View>
                  <Text style={styles.constituencyTurnout}>
                    {c.turnoutPercentage}%
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {election && election.status === "draft" && (
          <View style={styles.draftNotice}>
            <Text style={styles.draftNoticeText}>
              Registration and turnout figures will appear here once the
              election opens.
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>System Modules</Text>
        <View style={styles.moduleList}>
          {modules.map((module, index) => (
            <TouchableOpacity
              key={module.title}
              style={styles.moduleRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(module.route)}
            >
              <View style={styles.moduleIndex}>
                <Text style={styles.moduleIndexText}>
                  {String(index + 1).padStart(2, "0")}
                </Text>
              </View>
              <View style={styles.moduleTextWrap}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleSub}>{module.sub}</Text>
              </View>
              <Text style={styles.moduleArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton
          title="Terminate Admin Session"
          variant="outline"
          onPress={logout}
          style={{ marginTop: spacing.lg }}
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
  statRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
  statBlock: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.white,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primaryBorder,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  constituencyList: { marginBottom: spacing.xl },
  constituencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  constituencyTextWrap: { flex: 1 },
  constituencyName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  constituencyMeta: { fontSize: 12, color: colors.textMuted },
  constituencyTurnout: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },
  moduleList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  moduleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  moduleIndex: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleIndexText: { fontSize: 13, fontWeight: "800", color: colors.primary },
  moduleTextWrap: { flex: 1 },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  moduleSub: { fontSize: 13, color: colors.textMuted },
  moduleArrow: { fontSize: 18, color: colors.textLight, fontWeight: "300" },
  draftNotice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  draftNoticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMid,
    textAlign: "center",
  },
});

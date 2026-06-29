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

const FILTERS = [
  { label: "All", value: null },
  { label: "Admin", value: "admin" },
  { label: "Voter", value: "voter" },
  { label: "System", value: "system" },
];

const ACTION_LABELS = {
  "admin.login": "Admin signed in",
  "officer.login": "Officer signed in",
  "voter.registered": "Voter registered",
  "candidate.created": "Candidate added",
  "candidate.deleted": "Candidate removed",
  "election.opened": "Election opened",
  "election.closed": "Election closed",
  "election.published": "Results published",
};

function formatAction(action) {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];

  const [resource, verb] = action.split(".");
  if (!resource || !verb) return action;

  const readable = `${resource} ${verb}`.replace(/_/g, " ");
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

export default function AuditSecurityScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const [logs, setLogs] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const { execute, loading, errorType } = useNetworkRequest();

  useEffect(() => {
    loadLogs(activeFilter);
  }, []);

  const loadLogs = async (filter) => {
    const query = filter ? `?actorType=${filter}` : "";
    const result = await execute(async () => {
      return await adminRequest(`/admin/audit-logs${query}`, userData.token);
    });

    if (result.success) {
      setLogs(result.data.logs);
    }
  };

  const handleFilterChange = (value) => {
    setActiveFilter(value);
    loadLogs(value);
  };

  if (errorType === "network" && !logs) {
    return <NetworkErrorState onRetry={() => loadLogs(activeFilter)} />;
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
        <Text style={[typography.h1, styles.title]}>Audit & Security</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Every administrative action is recorded for accountability.
        </Text>

        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter.label}
              style={[
                styles.filterChip,
                activeFilter === filter.value && styles.filterChipActive,
              ]}
              onPress={() => handleFilterChange(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && !logs && (
          <Text style={styles.loadingText}>Loading activity…</Text>
        )}

        {logs && logs.length === 0 && (
          <Text style={styles.emptyText}>No activity in this category.</Text>
        )}

        {logs && logs.length > 0 && (
          <View style={styles.logList}>
            {logs.map((log) => (
              <View key={log.id} style={styles.logRow}>
                <Text style={styles.logAction}>{formatAction(log.action)}</Text>
                {log.targetSummary && (
                  <Text style={styles.logTarget}>{log.targetSummary}</Text>
                )}
                <Text style={styles.logMeta}>
                  {log.actorLabel || log.actorType} ·{" "}
                  {new Date(log.createdAt).toLocaleString()}
                </Text>
              </View>
            ))}
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
  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: { fontSize: 12, fontWeight: "700", color: colors.textMid },
  filterTextActive: { color: colors.white },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  logList: { marginBottom: spacing.md },
  logRow: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  logAction: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  logTarget: { fontSize: 13, color: colors.textMid, marginBottom: 4 },
  logMeta: { fontSize: 12, color: colors.textMuted },
});

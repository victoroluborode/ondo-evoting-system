import React, { useContext, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography, radius } from "../../theme";

const STATUS_STYLES = {
  draft: {
    bg: colors.background,
    border: colors.border,
    text: colors.textMid,
    label: "Draft",
  },
  open: {
    bg: "#EBF4EE",
    border: "#C8DFD0",
    text: colors.primary,
    label: "Open",
  },
  closed: {
    bg: "#FFF8E7",
    border: "#F0DDA0",
    text: colors.warning,
    label: "Closed",
  },
  published: {
    bg: "#EBF4EE",
    border: "#C8DFD0",
    text: colors.primary,
    label: "Published",
  },
  archived: {
    bg: "#F0F0F0",
    border: "#D0D0D0",
    text: "#5D6D7E",
    label: "Archived",
  },
};

const NEXT_TRANSITION = {
  draft: { label: "Open Election", endpoint: "open" },
  open: { label: "Close Election", endpoint: "close" },
  closed: { label: "Publish Results", endpoint: "publish" },
  published: { label: "Archive & Start New Election", endpoint: "archive" },
  archived: null,
};

export default function ElectionManagementScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const [election, setElection] = useState(null);
  const [transitionError, setTransitionError] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const { execute, errorType } = useNetworkRequest();

  const loadElection = useCallback(async () => {
    const result = await execute(async () => {
      return await adminRequest("/admin/election", userData.token);
    });

    if (result.success) {
      setElection(result.data.election);
    }
  }, [userData.token]);

  useFocusEffect(
    useCallback(() => {
      loadElection();
    }, [loadElection]),
  );

  const handleTransition = async () => {
    const transition = NEXT_TRANSITION[election.status];
    if (!transition) return;

    setTransitionError(null);
    setTransitioning(true);

    try {
      const data = await apiRequest(
        `/admin/elections/${election.id}/${transition.endpoint}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userData.token}` },
        },
      );
      setElection(data.election);
    } catch (err) {
      setTransitionError(err.message);
    } finally {
      setTransitioning(false);
    }
  };

  const confirmTransition = () => {
    const transition = NEXT_TRANSITION[election.status];
    if (!transition) return;

    Alert.alert(
      `${transition.label}?`,
      transition.endpoint === "open"
        ? "Voters will be able to cast ballots once this election opens. This cannot be undone."
        : transition.endpoint === "close"
          ? "No further votes will be accepted after closing."
          : transition.endpoint === "publish"
            ? "Published results are final and visible as official."
            : "This will archive the current election permanently and allow you to start a new one. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: transition.label, onPress: handleTransition },
      ],
    );
  };

  if (errorType === "network" && !election) {
    return <NetworkErrorState onRetry={loadElection} />;
  }

  if (!election) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading election…</Text>
      </View>
    );
  }

  const style = STATUS_STYLES[election.status];
  const transition = NEXT_TRANSITION[election.status];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.statusTag,
            { backgroundColor: style.bg, borderColor: style.border },
          ]}
        >
          <Text style={[styles.statusText, { color: style.text }]}>
            {style.label}
          </Text>
        </View>

        <Text style={[typography.h1, styles.title]}>{election.name}</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          House of Representatives
        </Text>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Starts</Text>
            <Text style={styles.detailValue}>
              {election.startsAt
                ? new Date(election.startsAt).toLocaleString()
                : "Not set"}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Ends</Text>
            <Text style={styles.detailValue}>
              {election.endsAt
                ? new Date(election.endsAt).toLocaleString()
                : "Not set"}
            </Text>
          </View>
        </View>

        <CustomButton
          title="Manage Candidates"
          variant="outline"
          onPress={() => navigation.navigate("CandidateManagement")}
          style={{ marginBottom: spacing.sm }}
        />
        <CustomButton
          title="Manage Parties"
          variant="outline"
          onPress={() => navigation.navigate("PartyManagement")}
        />

        {transitionError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{transitionError}</Text>
          </View>
        )}

        {transition && (
          <CustomButton
            title={transition.label}
            onPress={confirmTransition}
            loading={transitioning}
            disabled={transitioning}
            style={{ marginTop: spacing.lg }}
          />
        )}

        {!transition && election.status === "archived" && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              This election has been archived. Reload this screen to begin a new
              election cycle.
            </Text>
            <CustomButton
              title="Start New Election"
              onPress={loadElection}
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xl,
  },
  statusTag: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  statusText: { fontSize: 11, fontWeight: "800" },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  detailCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 13, color: colors.textMuted },
  detailValue: { fontSize: 13, fontWeight: "700", color: colors.text },
  errorBanner: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "#FDECEB",
    borderWidth: 1,
    borderColor: "#E8C0BC",
    marginTop: spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.error,
    lineHeight: 19,
  },
  notice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
  },
  noticeText: { fontSize: 13, lineHeight: 20, color: colors.textMid },
});

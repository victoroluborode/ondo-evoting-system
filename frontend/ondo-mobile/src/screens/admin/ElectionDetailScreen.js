import React, { useCallback, useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { adminRequest } from "../../services/adminApi";
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
};

const NEXT_TRANSITION = {
  draft: { action: "open", label: "Open Election", endpoint: "open" },
  open: { action: "close", label: "Close Election", endpoint: "close" },
  closed: { action: "publish", label: "Publish Results", endpoint: "publish" },
  published: null,
};

export default function ElectionDetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const { electionId } = route.params;
  const [election, setElection] = useState(null);
  const [transitionError, setTransitionError] = useState(null);
  const { execute, loading, errorType } = useNetworkRequest();
  const [transitioning, setTransitioning] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadElection();
    }, [])
  );

  const loadElection = async () => {
    const result = await execute(async () => {
      return await adminRequest("/admin/elections", userData.token);
    });

    if (result.success) {
      const found = result.data.elections.find((e) => e.id === electionId);
      setElection(found || null);
    }
  };

  const handleTransition = async () => {
    const transition = NEXT_TRANSITION[election.status];
    if (!transition) return;

    setTransitionError(null);
    setTransitioning(true);

    try {
      // And replace the IIFE inside handleTransition with a direct call:
      const data = await apiRequest(
        `/admin/elections/${electionId}/${transition.endpoint}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${userData.token}` },
        },
      );
      setElection(data.election);
    } catch (err) {
      // Surface the backend's exact validation message (e.g. candidate coverage,
      // election timing, or another open election of this type) rather than
      // inventing a generic one.
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
      transition.action === "open"
        ? "Voters will be able to cast ballots once this election opens. This cannot be undone."
        : transition.action === "close"
          ? "No further votes will be accepted after closing."
          : "Published results are final and visible as official.",
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
          {election.electionType.replace(/_/g, " ")}
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

        {!transition && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              This election has been published. No further lifecycle changes are
              possible.
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
  subtitle: { marginBottom: spacing.lg, textTransform: "capitalize" },
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

import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { colors, spacing, typography, radius } from "../../theme";
import { getOfflinePackage, queueVote } from "../../services/offlineVoteStore";
import * as Crypto from "expo-crypto";

export default function VoteReviewScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const { candidate, constituencyName } = route.params;
  const { execute, loading, error, errorType, clearError } =
    useNetworkRequest();

  const confirmVote = async () => {
    clearError();

    const result = await execute(async () => {
      return await apiRequest("/votes", {
        method: "POST",
        headers: { Authorization: `Bearer ${userData.token}` },
        body: JSON.stringify({ candidateId: candidate.id }),
      });
    });

    if (result.success) {
      navigation.replace("Receipt", { receiptCode: result.data.receiptCode });
      return;
    }

    if (result.errorType === "network") {
      const offlinePkg = await getOfflinePackage();

      if (!offlinePkg) {
        return;
      }

      const offlineVoteId = Crypto.randomUUID
        ? Crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      await queueVote({
        offlineVoteId,
        candidateId: candidate.id,
        offlineToken: offlinePkg.offlineToken,
        clientCastAt: new Date().toISOString(),
      });

      navigation.replace("OfflineVoteQueued", { offlineVoteId });
    }
  };

  if (errorType === "network") {
    return <NetworkErrorState onRetry={confirmVote} />;
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
        <View style={styles.headerRow}>
          <View style={styles.headerLabelRow}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={colors.textMuted}
            />
            <Text style={typography.label}>Final Review</Text>
          </View>

          <View style={styles.chip}>
            <Text style={styles.chipText}>Voter</Text>
          </View>
        </View>

        <Text style={[typography.h1, styles.title]}>Confirm Your Vote</Text>

        <View style={styles.warningBox}>
          <Ionicons
            name="warning-outline"
            size={22}
            color={colors.warning}
            style={styles.warningIcon}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.warningTitle}>Immutable Action</Text>
            <Text style={styles.warningText}>
              Once submitted, your vote cannot be changed or withdrawn. Review
              carefully before proceeding.
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Your Selected Candidate</Text>

        <View style={styles.selectionCard}>
          <View style={styles.selectionIconCircle}>
            <Ionicons
              name="person-circle-outline"
              size={34}
              color={colors.primary}
            />
          </View>

          <Text style={styles.candidateName}>
            {candidate?.name || "No candidate selected"}
          </Text>

          <Text style={styles.candidateParty}>
            {candidate?.party || "—"}{" "}
            {constituencyName ? `· ${constituencyName}` : ""}
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <CustomButton
            title="Cast Secure Vote"
            loading={loading}
            onPress={confirmVote}
            disabled={loading}
          />

          <CustomButton
            title="Start Selection Again"
            variant="outline"
            style={{ marginTop: spacing.sm }}
            disabled={loading}
            onPress={() => navigation.replace("Ballot")}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },

  headerLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  chip: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },

  chipText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  title: {
    marginBottom: spacing.lg,
  },

  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F0DDA0",
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },

  warningIcon: {
    marginTop: 1,
  },

  warningTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.warning,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#7A5A10",
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "#FDECEB",
    borderWidth: 1,
    borderColor: "#E8C0BC",
    marginBottom: spacing.md,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colors.error,
    lineHeight: 19,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },

  selectionCard: {
    backgroundColor: colors.primaryDim,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: "center",
    marginBottom: spacing.lg,
  },

  selectionIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },

  candidateName: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
  },

  candidateParty: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 6,
    textAlign: "center",
  },

  actionGroup: {
    marginBottom: spacing.md,
  },
});

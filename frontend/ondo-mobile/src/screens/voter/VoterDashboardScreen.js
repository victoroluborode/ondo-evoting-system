// VoterDashboardScreen.js — rebuilt with more substance, same simplicity
import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { useConstituencyLookup } from "../../hooks/useConstituencyLookup";
import { colors, spacing, typography, radius } from "../../theme";

function useCountdown(targetIso) {
  const [label, setLabel] = useState(null);

  React.useEffect(() => {
    if (!targetIso) return;
    const tick = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) {
        setLabel("Closing soon");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`,
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetIso]);

  return label;
}

export default function VoterDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData, logout } = useContext(AuthContext);
  const { getConstituencyName } = useConstituencyLookup();
  const [electionStatus, setElectionStatus] = useState(null);
  const { execute, loading } = useNetworkRequest();
  const countdown = useCountdown(electionStatus?.election?.endsAt);

  const loadElectionStatus = useCallback(async () => {
    const result = await execute(async () =>
      apiRequest("/ballots/election-status"),
    );
    if (result.success) setElectionStatus(result.data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadElectionStatus();
    }, [loadElectionStatus]),
  );

  const constituencyName =
    getConstituencyName(userData.constituencyId) ||
    `Constituency ${userData.constituencyId}`;

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
          <View style={{ flex: 1 }}>
            <Text style={[typography.h1, styles.title]}>
              Hi, {userData.fullName?.split(" ")[0] || "Voter"}
            </Text>
            <Text style={typography.subtitle}>Welcome to your dashboard.</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={colors.primary}
            />
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VIN</Text>
            <Text style={styles.infoValue}>{userData.vin}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Constituency</Text>
            <Text style={styles.infoValue}>{constituencyName}</Text>
          </View>
        </View>

        {loading && !electionStatus && (
          <Text style={styles.loadingText}>Checking election status…</Text>
        )}

        {electionStatus && electionStatus.isOpen && (
          <View style={styles.voteCard}>
            <View style={styles.statusTag}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Election Live</Text>
            </View>
            <Text style={styles.voteCardTitle}>
              {electionStatus.election?.name || "Cast Your Vote"}
            </Text>
            <Text style={styles.voteCardSubtitle}>
              Your vote is encrypted and anonymous. It only takes a minute.
            </Text>

            {countdown && (
              <View style={styles.countdownBox}>
                <Text style={styles.countdownLabel}>Polls Close In</Text>
                <Text style={styles.countdownValue}>{countdown}</Text>
              </View>
            )}

            <CustomButton
              title="Go to Ballot"
              onPress={() => navigation.navigate("FingerprintVerification")}
            />
          </View>
        )}

        {electionStatus && !electionStatus.isOpen && (
          <View style={styles.closedCard}>
            <View style={[styles.statusTag, styles.statusTagClosed]}>
              <View style={[styles.statusDot, styles.statusDotClosed]} />
              <Text style={[styles.statusText, styles.statusTextClosed]}>
                Not Open
              </Text>
            </View>
            <Text style={styles.voteCardTitle}>Voting Isn't Open Yet</Text>
            <Text style={styles.closedSubtitle}>
              There's no election currently open for voting. Check back once
              your election begins.
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>How Voting Works</Text>
        <View style={styles.guideCard}>
          {[
            {
              icon: "finger-print",
              text: "Verify your identity with your fingerprint or face",
            },
            {
              icon: "list-outline",
              text: "Select your candidate from your constituency ballot",
            },
            {
              icon: "checkmark-done-outline",
              text: "Review and confirm — your vote is final once submitted",
            },
            {
              icon: "receipt-outline",
              text: "Get a private receipt code as proof your vote was recorded",
            },
          ].map((step, i) => (
            <View
              key={i}
              style={[styles.guideRow, i === 3 && styles.guideRowLast]}
            >
              <Ionicons
                name={step.icon}
                size={18}
                color={colors.primary}
                style={{ marginRight: spacing.sm }}
              />
              <Text style={styles.guideText}>{step.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Voting Security</Text>

        <View style={styles.helpRow}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={styles.helpText}>
            Your vote is encrypted before it is recorded. Your receipt only
            proves a ballot was submitted — it does not reveal your candidate.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <TouchableOpacity onPress={logout} style={styles.logoutRow}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
  },
  title: { marginBottom: 2 },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: 13, color: colors.textMuted },
  infoValue: { fontSize: 13, fontWeight: "800", color: colors.text },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
  voteCard: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  closedCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  statusTagClosed: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  statusDotClosed: { backgroundColor: colors.textMuted },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusTextClosed: { color: colors.textMuted },
  voteCardTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  voteCardSubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.primaryMid,
    marginBottom: spacing.md,
  },
  closedSubtitle: { fontSize: 13, lineHeight: 19, color: colors.textMuted },
  countdownBox: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "rgba(255,255,255,0.7)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.white,
    fontVariant: ["tabular-nums"],
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  guideCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  guideRowLast: { borderBottomWidth: 0 },
  guideText: { fontSize: 13, color: colors.textMid, flex: 1, lineHeight: 19 },
  helpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  helpText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.text },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
  logoutRow: { alignItems: "center", paddingVertical: spacing.sm },
  logoutText: { fontSize: 14, fontWeight: "700", color: colors.textMuted },
});

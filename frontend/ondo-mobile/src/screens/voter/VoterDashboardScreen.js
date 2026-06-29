import React, { useCallback, useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography, radius } from "../../theme";
import { useConstituencyLookup } from "../../hooks/useConstituencyLookup";

export default function VoterDashboardScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData, logout } = useContext(AuthContext);
  const [electionStatus, setElectionStatus] = useState(null);
  const { execute, loading } = useNetworkRequest();
  const { getConstituencyName } = useConstituencyLookup();

  useFocusEffect(
    useCallback(() => {
      loadElectionStatus();
    }, []),
  );

  const loadElectionStatus = async () => {
    const result = await execute(async () => {
      return await apiRequest("/ballots/election-status");
    });

    console.log("Dashboard tokens:", {
      token: userData.token,
      sessionToken: userData.sessionToken,
    });

    if (result.success) {
      setElectionStatus(result.data);
    }
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
        <Text style={[typography.h1, styles.title]}>
          Hi, {userData.fullName?.split(" ")[0] || "Voter"}
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Here's your voting status for this election.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>VIN</Text>
            <Text style={styles.infoValue}>{userData.vin}</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Constituency</Text>
            <Text style={styles.infoValue}>
              {getConstituencyName(userData.constituencyId) ||
                `Constituency ${userData.constituencyId}`}
            </Text>
          </View>
        </View>

        {loading && !electionStatus && (
          <Text style={styles.loadingText}>Checking election status…</Text>
        )}

        {electionStatus && electionStatus.isOpen && (
          <View style={styles.voteCard}>
            <View style={styles.statusTag}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Pending</Text>
            </View>
            <Text style={styles.voteCardTitle}>Cast Your Vote</Text>
            <Text style={styles.voteCardSubtitle}>
              You haven't voted yet. When you're ready, verify your identity to
              access your ballot.
            </Text>
            <CustomButton
              title="Go to Ballot"
              onPress={() => {
                if (userData.token) {
                  navigation.navigate("Ballot");
                } else if (userData.fingerprintLocked) {
                  navigation.navigate("FaceVerification");
                } else {
                  navigation.navigate("FingerprintVerification");
                }
              }}
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
            <Text style={styles.voteCardSubtitle}>
              There's no election currently open for voting. Check back once
              your election begins.
            </Text>
          </View>
        )}
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
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
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
  },
  closedCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
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
    backgroundColor: colors.warning,
  },
  statusDotClosed: { backgroundColor: colors.textMuted },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.warning,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusTextClosed: { color: colors.textMuted },
  voteCardTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  voteCardSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.primaryMid,
    marginBottom: spacing.lg,
  },
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

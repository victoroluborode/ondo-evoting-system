import React, { useCallback, useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { apiRequest } from "../../services/api";
import { colors, spacing, typography, radius } from "../../theme";

// Deterministic color per party code so the same party always reads the same
// way across the app, not randomly assigned per render.
const PARTY_COLORS = {
  APC: "#1A6B3C",
  PDP: "#A6192E",
  LP: "#006837",
  NNPP: "#7A1FA2",
  ZLP: "#0B5394",
  SDP: "#C9922A",
  ADC: "#2C3E50",
  APGA: "#D35400",
  YPP: "#117A65",
  APP: "#8E44AD",
  AA: "#16A085",
  AAC: "#C0392B",
};

function getPartyColor(party) {
  return PARTY_COLORS[party] || "#5D6D7E";
}

export default function BallotScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState(null);
  const [constituencyName, setConstituencyName] = useState(null);
  const { execute, loading, errorType } = useNetworkRequest();

  useFocusEffect(
    useCallback(() => {
      loadBallot();
    }, []),
  );

  // BallotScreen.js — update loadBallot's error handling
  const loadBallot = async () => {
    const result = await execute(async () => {
      const [ballotRes, constituenciesRes] = await Promise.all([
        apiRequest(`/ballots/${userData.constituencyId}`, {
          headers: { Authorization: `Bearer ${userData.token}` },
        }),
        apiRequest("/ballots/constituencies"),
      ]);
      return { ballotRes, constituenciesRes };
    });

    if (!result.success) {
      const data = result.error?.data;
      if (data?.alreadyVoted) {
        navigation.replace("AlreadyVoted", {
          receiptCode: data.receiptCode,
          fromSync: true,
        });
        return;
      }
      return; // other errors fall through to existing error handling
    }

    setCandidates(result.data.ballotRes.candidates);
    const match = result.data.constituenciesRes.constituencies.find(
      (c) => c.id === userData.constituencyId,
    );
    setConstituencyName(
      match?.name || `Constituency ${userData.constituencyId}`,
    );
  };

  const handleSelection = () => {
    if (!selectedCandidate) return;
    const candidateData = candidates.find((c) => c.id === selectedCandidate);
    navigation.navigate("VoteReview", {
      candidate: candidateData,
      constituencyName,
    });
  };

  if (errorType === "network" && !candidates) {
    return <NetworkErrorState onRetry={loadBallot} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>
          {constituencyName || "Loading constituency…"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Official Ballot</Text>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            Tap a candidate to select them. You'll be able to review your choice
            before it's final — once submitted, it cannot be changed.
          </Text>
        </View>

        {loading && !candidates && (
          <Text style={styles.loadingText}>Loading your ballot…</Text>
        )}

        {candidates && (
          <View style={styles.candidateList}>
            {candidates.map((candidate) => {
              const isSelected = selectedCandidate === candidate.id;
              const partyColor = getPartyColor(candidate.party);
              return (
                <TouchableOpacity
                  key={candidate.id}
                  style={[styles.row, isSelected && styles.rowSelected]}
                  onPress={() => setSelectedCandidate(candidate.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[styles.partyBlock, { backgroundColor: partyColor }]}
                  >
                    <Text style={styles.partyBlockText}>{candidate.party}</Text>
                  </View>
                  <View style={styles.candidateInfo}>
                    <Text style={styles.candName}>{candidate.name}</Text>
                  </View>
                  <View
                    style={[styles.radio, isSelected && styles.radioActive]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
        <CustomButton
          title="Review Selection"
          disabled={!selectedCandidate}
          onPress={handleSelection}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primaryDim,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.primaryBorder,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  badgeText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  title: { marginBottom: spacing.md },
  instructionCard: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  instructionText: { fontSize: 13, lineHeight: 20, color: colors.textMid },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  candidateList: { gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: 76,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  partyBlock: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  partyBlockText: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 0.5,
  },
  candidateInfo: { flex: 1 },
  candName: { fontSize: 16, fontWeight: "800", color: colors.text },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
});

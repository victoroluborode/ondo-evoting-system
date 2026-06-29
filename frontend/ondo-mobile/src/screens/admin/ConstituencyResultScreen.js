import React, { useCallback, useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography, radius } from "../../theme";

export default function ConstituencyResultScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const { constituencyId, constituencyName } = route.params;
  const [results, setResults] = useState(null);
  const { execute, loading, errorType } = useNetworkRequest();

  useFocusEffect(
    useCallback(() => {
      loadResults();
    }, [])
  );

  
  const loadResults = async () => {
    const result = await execute(async () => {
      return await adminRequest(
        `/admin/results/${constituencyId}`,
        userData.token,
      );
    });

    if (result.success) {
      setResults(result.data.results);
    }
  };

  if (errorType === "network" && !results) {
    return <NetworkErrorState onRetry={loadResults} />;
  }

  const totalVotes = results
    ? results.reduce((sum, r) => sum + r.voteCount, 0)
    : 0;
  const topVotes = results && results.length > 0 ? results[0].voteCount : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>{constituencyName}</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          {totalVotes.toLocaleString()} total votes recorded
        </Text>

        {loading && !results && (
          <Text style={styles.loadingText}>Loading results…</Text>
        )}

        {results && results.length === 0 && (
          <Text style={styles.emptyText}>
            No candidates found for this constituency.
          </Text>
        )}

        {results && results.length > 0 && (
          <View style={styles.candidateList}>
            {results.map((c) => {
              const isLeading = c.voteCount === topVotes && topVotes > 0;
              const percent =
                totalVotes > 0
                  ? ((c.voteCount / totalVotes) * 100).toFixed(1)
                  : "0.0";
              return (
                <View
                  key={c.id}
                  style={[
                    styles.candidateRow,
                    isLeading && styles.candidateRowLeading,
                  ]}
                >
                  <View style={styles.candidateTextWrap}>
                    <View style={styles.candidateNameRow}>
                      <Text style={styles.candidateName}>{c.name}</Text>
                      {isLeading && (
                        <View style={styles.leadingTag}>
                          <Text style={styles.leadingTagText}>Leading</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.candidateParty}>{c.party}</Text>
                  </View>
                  <View style={styles.candidateVotesWrap}>
                    <Text style={styles.candidateVotes}>
                      {c.voteCount.toLocaleString()}
                    </Text>
                    <Text style={styles.candidatePercent}>{percent}%</Text>
                  </View>
                </View>
              );
            })}
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
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  candidateList: { marginTop: spacing.xs },
  candidateRow: {
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
  candidateRowLeading: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  candidateTextWrap: { flex: 1 },
  candidateNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 3,
  },
  candidateName: { fontSize: 15, fontWeight: "800", color: colors.text },
  leadingTag: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  leadingTagText: { fontSize: 10, fontWeight: "800", color: colors.white },
  candidateParty: { fontSize: 12, color: colors.textMuted },
  candidateVotesWrap: { alignItems: "flex-end" },
  candidateVotes: { fontSize: 16, fontWeight: "900", color: colors.text },
  candidatePercent: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    marginTop: 2,
  },
});

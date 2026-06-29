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
import CustomInput from "../../components/CustomInput";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography, radius } from "../../theme";
import { useConstituencyLookup } from "../../hooks/useConstituencyLookup";

export default function VoterManagementScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const [search, setSearch] = useState("");
  const [voters, setVoters] = useState(null);
  const { execute, loading, errorType } = useNetworkRequest();
  const { getConstituencyName } = useConstituencyLookup();

  useEffect(() => {
    loadVoters();
  }, []);

  const loadVoters = async (query = "") => {
    const params = query ? `?search=${encodeURIComponent(query)}` : "";
    const result = await execute(async () => {
      return await adminRequest(`/admin/voters${params}`, userData.token);
    });

    if (result.success) {
      setVoters(result.data.voters);
    }
  };

  const handleSearchSubmit = () => {
    loadVoters(search.trim());
  };

  if (errorType === "network" && !voters) {
    return <NetworkErrorState onRetry={() => loadVoters(search.trim())} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Voter Management</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Search registered voters across all constituencies.
        </Text>

        <CustomInput
          placeholder="Search by name or VIN"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />

        {loading && <Text style={styles.loadingText}>Searching…</Text>}

        {voters && voters.length === 0 && (
          <Text style={styles.emptyText}>No voters match your search.</Text>
        )}

        {voters && voters.length > 0 && (
          <View style={styles.voterList}>
            {voters.map((voter) => (
              <TouchableOpacity
                key={voter.id}
                style={styles.voterRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate("VoterDetail", { voter })}
              >
                <View style={styles.voterTextWrap}>
                  <Text style={styles.voterName}>{voter.fullName}</Text>
                  <Text style={styles.voterMeta}>
                    {voter.vin} ·{" "}
                    {getConstituencyName(voter.constituencyId) ||
                      `Constituency ${voter.constituencyId}`}
                  </Text>
                </View>
                <Text style={styles.voterArrow}>→</Text>
              </TouchableOpacity>
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
  voterList: { marginTop: spacing.sm },
  voterRow: {
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
  voterTextWrap: { flex: 1 },
  voterName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  voterMeta: { fontSize: 12, color: colors.textMuted },
  voterArrow: { fontSize: 16, color: colors.textLight, fontWeight: "300" },
});

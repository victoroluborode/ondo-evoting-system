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
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography, radius } from "../../theme";

export default function ConstituencyManagementScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const [constituencies, setConstituencies] = useState(null);
  const { execute, loading, errorType } = useNetworkRequest();

  useFocusEffect(
    useCallback(() => {
      loadConstituencies();
    }, [])
  );

  const loadConstituencies = async () => {
    const result = await execute(async () => {
      return await adminRequest("/admin/constituencies", userData.token);
    });

    if (result.success) {
      setConstituencies(result.data.constituencies);
    }
  };

  if (errorType === "network" && !constituencies) {
    return <NetworkErrorState onRetry={loadConstituencies} />;
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
        <Text style={[typography.h1, styles.title]}>Constituencies</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          {constituencies
            ? `${constituencies.length} Federal Constituencies across Ondo State.`
            : "Loading…"}
        </Text>

        {loading && !constituencies && (
          <Text style={styles.loadingText}>Loading constituencies…</Text>
        )}

        {constituencies && (
          <View style={styles.list}>
            {constituencies.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.row}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("ConstituencyDetail", { constituency: c })
                }
              >
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowName}>{c.name}</Text>
                  <Text style={styles.rowMeta}>
                    {c.code} · {c.lgas?.length || 0} LGA
                    {c.lgas?.length === 1 ? "" : "s"}
                  </Text>
                </View>
                <Text style={styles.rowArrow}>→</Text>
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
    marginTop: spacing.lg,
  },
  list: { marginTop: spacing.xs },
  row: {
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
  rowTextWrap: { flex: 1 },
  rowName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  rowMeta: { fontSize: 12, color: colors.textMuted },
  rowArrow: { fontSize: 16, color: colors.textLight, fontWeight: "300" },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

const STATUS_STYLES = {
  Synced: { bg: "#EBF4EE", border: "#C8DFD0", text: "#0F4C2A" },
  Offline: { bg: "#FDECEB", border: "#E8C0BC", text: "#C0392B" },
  Syncing: { bg: "#FFF8E7", border: "#F0DDA0", text: "#A66C00" },
};

const INITIAL_LOCATIONS = [
  {
    id: "1",
    name: "Akure South",
    status: "Synced",
    pending: 0,
    lastSync: "Just now",
    history: ["9:40 AM — Synced", "9:10 AM — Synced", "8:40 AM — Synced"],
  },
  {
    id: "2",
    name: "Ondo West",
    status: "Offline",
    pending: 142,
    lastSync: "47 minutes ago",
    history: [
      "9:55 AM — Connection lost",
      "9:08 AM — Synced",
      "8:38 AM — Synced",
    ],
  },
  {
    id: "3",
    name: "Okitipupa",
    status: "Syncing",
    pending: 18,
    lastSync: "2 minutes ago",
    history: [
      "9:58 AM — Syncing started",
      "9:28 AM — Synced",
      "8:58 AM — Synced",
    ],
  },
];

const ANOMALY_COUNT = 2;

export default function OfflineSyncMonitorScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [locations, setLocations] = useState(INITIAL_LOCATIONS);
  const [syncing, setSyncing] = useState(false);

  const totalPending = locations.reduce((sum, loc) => sum + loc.pending, 0);

  const handleSyncAll = () => {
    setSyncing(true);
    setTimeout(() => {
      setLocations((prev) =>
        prev.map((loc) => ({
          ...loc,
          status: "Synced",
          pending: 0,
          lastSync: "Just now",
        })),
      );
      setSyncing(false);
      Alert.alert("Sync complete", "All polling locations are now up to date.");
    }, 2000);
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
        <Text style={[typography.h1, styles.title]}>Election Monitoring</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          See which polling locations are sending in results and watch for
          unusual activity.
        </Text>

        <View style={styles.statHero}>
          <Text style={styles.statLabel}>Records Waiting to Send</Text>
          <Text style={styles.statValue}>{totalPending}</Text>
        </View>

        {ANOMALY_COUNT > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("AnomalyFeed")}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>Unusual Activity Detected</Text>
              <Text style={styles.alertText}>
                {ANOMALY_COUNT} alert{ANOMALY_COUNT === 1 ? "" : "s"} need your
                attention.
              </Text>
            </View>
            <Text style={styles.alertArrow}>→</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionLabel}>Polling Locations</Text>

        <View style={styles.nodeList}>
          {locations.map((loc) => {
            const style = STATUS_STYLES[loc.status];
            return (
              <TouchableOpacity
                key={loc.id}
                style={styles.nodeRow}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate("PollingLocationDetail", {
                    location: loc,
                  })
                }
              >
                <View style={styles.nodeTextWrap}>
                  <Text style={styles.nodeName}>{loc.name}</Text>
                  <View
                    style={[
                      styles.statusTag,
                      { backgroundColor: style.bg, borderColor: style.border },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: style.text }]}>
                      {loc.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.nodeRightWrap}>
                  <Text style={styles.pendingText}>
                    {loc.pending === 0
                      ? "Up to date"
                      : `${loc.pending} waiting`}
                  </Text>
                  <Text style={styles.nodeArrow}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <CustomButton
          title={
            totalPending === 0
              ? "All Locations Up to Date"
              : "Sync All Polling Locations"
          }
          variant="outline"
          onPress={handleSyncAll}
          disabled={totalPending === 0 || syncing}
          style={{ marginTop: spacing.lg }}
        />
        {syncing && (
          <View style={styles.syncingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.syncingText}>
              Contacting polling locations…
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
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  statHero: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.primaryBorder,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 48,
    fontWeight: "900",
    color: colors.white,
    marginTop: 4,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "#FDECEB",
    borderWidth: 1,
    borderColor: "#E8C0BC",
    marginBottom: spacing.xl,
  },
  alertTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.error,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  alertText: { fontSize: 13, lineHeight: 20, color: "#8C2A20" },
  alertArrow: { fontSize: 16, color: colors.error, fontWeight: "300" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  nodeList: { marginBottom: spacing.md },
  nodeRow: {
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
  nodeTextWrap: { flex: 1 },
  nodeName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 6,
  },
  statusTag: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: "800" },
  nodeRightWrap: { alignItems: "flex-end", gap: 4 },
  pendingText: { fontSize: 13, fontWeight: "700", color: colors.textMid },
  nodeArrow: { fontSize: 16, color: colors.textLight, fontWeight: "300" },
  syncingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  syncingText: { fontSize: 13, color: colors.textMuted, fontWeight: "600" },
});

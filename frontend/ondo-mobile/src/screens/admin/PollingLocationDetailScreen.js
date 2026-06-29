import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography, radius } from "../../theme";

const STATUS_STYLES = {
  Synced: { bg: "#EBF4EE", border: "#C8DFD0", text: "#0F4C2A" },
  Offline: { bg: "#FDECEB", border: "#E8C0BC", text: "#C0392B" },
  Syncing: { bg: "#FFF8E7", border: "#F0DDA0", text: "#A66C00" },
};

export default function PollingLocationDetailScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { location } = route.params;
  const style = STATUS_STYLES[location.status];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>{location.name}</Text>
        <View
          style={[
            styles.statusTag,
            { backgroundColor: style.bg, borderColor: style.border },
          ]}
        >
          <Text style={[styles.statusText, { color: style.text }]}>
            {location.status}
          </Text>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last contact</Text>
            <Text style={styles.detailValue}>{location.lastSync}</Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Waiting to send</Text>
            <Text style={styles.detailValue}>{location.pending} records</Text>
          </View>
        </View>

        {location.status === "Offline" && (
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Why this matters</Text>
            <Text style={styles.noticeText}>
              This location hasn't connected recently. Records already cast are
              stored safely on-device and will send automatically once
              connection returns.
            </Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Recent History</Text>
        <View style={styles.historyList}>
          {location.history.map((entry, index) => (
            <View key={index} style={styles.historyRow}>
              <View style={styles.historyDot} />
              <Text style={styles.historyText}>{entry}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { marginBottom: spacing.sm },
  statusTag: {
    alignSelf: "flex-start",
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.lg,
  },
  statusText: { fontSize: 11, fontWeight: "800" },
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
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailRowLast: { borderBottomWidth: 0 },
  detailLabel: { fontSize: 13, color: colors.textMuted },
  detailValue: { fontSize: 13, fontWeight: "800", color: colors.text },
  notice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F0DDA0",
    marginBottom: spacing.lg,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.warning,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  noticeText: { fontSize: 13, lineHeight: 20, color: "#7A5A10" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  historyList: { marginBottom: spacing.md },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  historyText: { fontSize: 13, color: colors.textMid },
});

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography, radius } from "../../theme";

const MOCK_ANOMALIES = [
  {
    id: "1",
    type: "Repeated Failed Logins",
    location: "Ondo West",
    detail: "14 failed authentication attempts from one device in 3 minutes.",
    severity: "high",
    time: "9:52 AM",
  },
  {
    id: "2",
    type: "Abnormal Vote Rate",
    location: "Idanre / Ifedore",
    detail:
      "Votes were submitted faster than is typically possible for one polling unit.",
    severity: "medium",
    time: "9:31 AM",
  },
];

const SEVERITY_STYLES = {
  high: {
    bg: "#FDECEB",
    border: "#E8C0BC",
    text: "#C0392B",
    label: "High Priority",
  },
  medium: {
    bg: "#FFF8E7",
    border: "#F0DDA0",
    text: "#A66C00",
    label: "Needs Review",
  },
};

export default function AnomalyFeedScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>Unusual Activity</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          The system flags patterns that may indicate a problem, like repeated
          failed logins or unusually fast voting.
        </Text>

        <View style={styles.anomalyList}>
          {MOCK_ANOMALIES.map((anomaly) => {
            const sevStyle = SEVERITY_STYLES[anomaly.severity];
            return (
              <TouchableOpacity
                key={anomaly.id}
                style={styles.anomalyRow}
                activeOpacity={0.7}
              >
                <View style={styles.anomalyHeader}>
                  <Text style={styles.anomalyType}>{anomaly.type}</Text>
                  <View
                    style={[
                      styles.severityTag,
                      {
                        backgroundColor: sevStyle.bg,
                        borderColor: sevStyle.border,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.severityText, { color: sevStyle.text }]}
                    >
                      {sevStyle.label}
                    </Text>
                  </View>
                </View>
                <Text style={styles.anomalyDetail}>{anomaly.detail}</Text>
                <Text style={styles.anomalyMeta}>
                  {anomaly.location} · {anomaly.time}
                </Text>
              </TouchableOpacity>
            );
          })}

          {MOCK_ANOMALIES.length === 0 && (
            <Text style={styles.emptyText}>No unusual activity detected.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  title: { marginBottom: spacing.xs },
  subtitle: { marginBottom: spacing.lg },
  anomalyList: { marginTop: spacing.xs },
  anomalyRow: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  anomalyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: spacing.sm,
  },
  anomalyType: { fontSize: 15, fontWeight: "800", color: colors.text, flex: 1 },
  severityTag: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  severityText: { fontSize: 10, fontWeight: "800" },
  anomalyDetail: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMid,
    marginBottom: 6,
  },
  anomalyMeta: { fontSize: 12, color: colors.textMuted },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.lg,
  },
});

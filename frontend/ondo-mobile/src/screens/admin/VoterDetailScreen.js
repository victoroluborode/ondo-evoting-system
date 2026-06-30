import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography, radius } from "../../theme";
import { useConstituencyLookup } from "../../hooks/useConstituencyLookup";
import { AuthContext } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import CustomButton from "../../components/CustomButton";

export default function VoterDetailScreen({ route }) {
  const insets = useSafeAreaInsets();
  const [voter, setVoter] = useState(route.params.voter); // ← local, mutable copy
  const { getConstituencyName, getLgaName } = useConstituencyLookup();
  const { userData } = useContext(AuthContext);
  const [reinstating, setReinstating] = useState(false);

  const handleReinstate = () => {
    Alert.alert(
      `Reinstate ${voter.fullName}?`,
      "This voter will be able to sign in and vote again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reinstate",
          onPress: async () => {
            setReinstating(true);
            try {
              await apiRequest(`/admin/voters/${voter.id}/reinstate`, {
                method: "POST",
                headers: { Authorization: `Bearer ${userData.token}` },
                body: JSON.stringify({ constituencyId: voter.constituencyId }),
              });
              setVoter((prev) => ({ ...prev, status: "registered" })); // ← update local state immediately
            } catch (err) {
              Alert.alert("Could Not Reinstate", err.message);
            } finally {
              setReinstating(false);
            }
          },
        },
      ],
    );
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
        <Text style={[typography.h1, styles.title]}>{voter.fullName}</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Registered voter record.
        </Text>

        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>VIN</Text>
            <Text style={styles.detailValue}>{voter.vin}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Constituency</Text>
            <Text style={styles.detailValue}>
              {getConstituencyName(voter.constituencyId) ||
                voter.constituencyId}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>LGA</Text>
            <Text style={styles.detailValue}>
              {getLgaName(voter.constituencyId, voter.lgaId) || voter.lgaId}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{voter.email || "—"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{voter.phoneNumber || "—"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text
              style={[
                styles.detailValue,
                voter.status === "suspended" && { color: colors.error },
              ]}
            >
              {voter.status ? voter.status.toUpperCase() : "ACTIVE"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Biometrics</Text>
            <Text style={styles.detailValue}>
              {voter.fingerprintEnrolled && voter.faceEnrolled
                ? "Fingerprint + Face"
                : voter.fingerprintEnrolled
                  ? "Fingerprint only"
                  : voter.faceEnrolled
                    ? "Face only"
                    : "None"}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Has Voted</Text>
            <Text style={styles.detailValue}>
              {voter.hasVoted ? "Yes" : "No"}
            </Text>
          </View>
        </View>

        {voter.status === "suspended" && (
          <CustomButton
            title="Reinstate Voter"
            onPress={handleReinstate}
            loading={reinstating}
            style={{ marginTop: spacing.lg }}
          />
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
  detailCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
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
});

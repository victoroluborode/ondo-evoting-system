import React, { useContext, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../context/AuthContext";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { apiRequest } from "../../services/api";
import { useConstituencyLookup } from "../../hooks/useConstituencyLookup";
import { colors, spacing, typography, radius } from "../../theme";

export default function PendingVotersScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const { getConstituencyName, getLgaName } = useConstituencyLookup();
  const [pendingVoters, setPendingVoters] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const { execute, loading, errorType } = useNetworkRequest();

  const loadPending = useCallback(async () => {
    const result = await execute(async () => {
      return await adminRequest("/admin/voters/pending", userData.token);
    });

    if (result.success) {
      setPendingVoters(result.data.voters);
    }
  }, [userData.token]);

  useFocusEffect(
    useCallback(() => {
      loadPending();
    }, [loadPending]),
  );

  const handleApprove = (voter) => {
    Alert.alert(
      `Approve ${voter.fullName}?`,
      "This voter will be able to sign in and vote immediately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            setProcessingId(voter.id);
            try {
              await apiRequest(`/admin/voters/${voter.id}/approve`, {
                method: "POST",
                headers: { Authorization: `Bearer ${userData.token}` },
                body: JSON.stringify({ constituencyId: voter.constituencyId }),
              });
              setPendingVoters((prev) => prev.filter((v) => v.id !== voter.id));
            } catch (err) {
              Alert.alert("Could Not Approve", err.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  const handleReject = (voter) => {
    Alert.alert(
      `Reject ${voter.fullName}?`,
      "This will suspend the registration. The voter will not be able to sign in.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            setProcessingId(voter.id);
            try {
              await apiRequest(`/admin/voters/${voter.id}/reject`, {
                method: "POST",
                headers: { Authorization: `Bearer ${userData.token}` },
                body: JSON.stringify({ constituencyId: voter.constituencyId }),
              });
              setPendingVoters((prev) => prev.filter((v) => v.id !== voter.id));
            } catch (err) {
              Alert.alert("Could Not Reject", err.message);
            } finally {
              setProcessingId(null);
            }
          },
        },
      ],
    );
  };

  if (errorType === "network" && !pendingVoters) {
    return <NetworkErrorState onRetry={loadPending} />;
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
        <Text style={[typography.h1, styles.title]}>Pending Registrations</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Review voter registrations before they can sign in and vote.
        </Text>

        {loading && !pendingVoters && (
          <Text style={styles.loadingText}>Loading pending registrations…</Text>
        )}

        {pendingVoters && pendingVoters.length === 0 && (
          <Text style={styles.emptyText}>
            No registrations awaiting review.
          </Text>
        )}

        {pendingVoters &&
          pendingVoters.map((voter) => (
            <View key={voter.id} style={styles.card}>
              <Text style={styles.voterName}>{voter.fullName}</Text>
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
                <Text style={styles.detailLabel}>Contact</Text>
                <Text style={styles.detailValue}>
                  {voter.email || voter.phoneNumber || "—"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Biometrics</Text>
                <Text style={styles.detailValue}>
                  {voter.fingerprintEnrolled && voter.faceEnrolled
                    ? "Fingerprint + Face"
                    : voter.faceEnrolled
                      ? "Face only"
                      : "Incomplete"}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(voter)}
                  disabled={processingId === voter.id}
                >
                  <Text style={styles.approveText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(voter)}
                  disabled={processingId === voter.id}
                >
                  <Text style={styles.rejectText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  voterName: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: { fontSize: 12, color: colors.textMuted },
  detailValue: { fontSize: 12, fontWeight: "700", color: colors.text },
  actionRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  approveBtn: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  approveText: { fontSize: 13, fontWeight: "700", color: colors.primary },
  rejectBtn: {
    backgroundColor: "#FDECEB",
    borderWidth: 1,
    borderColor: "#E8C0BC",
  },
  rejectText: { fontSize: 13, fontWeight: "700", color: colors.error },
});

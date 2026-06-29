import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import SelectField from "../../components/SelectField";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography, radius } from "../../theme";
import { apiRequest } from "../../services/api";

export default function CandidateManagementScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const [constituencies, setConstituencies] = useState(null);
  const [parties, setParties] = useState(null);
  const [openElection, setOpenElection] = useState(null);
  const [selectedConstituency, setSelectedConstituency] = useState(null);
  const [candidates, setCandidates] = useState(null);
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [party, setParty] = useState("");
  const [editingCandidate, setEditingCandidate] = useState(null);

  const handleEditCandidate = (candidate) => {
    setEditingCandidate(candidate);
    const parts = candidate.name.split(" ");
    setSurname(parts[0] || "");
    setFirstName(parts.slice(1).join(" ") || "");
    setParty(candidate.party);
  };

  const handleDeleteCandidate = (candidate) => {
    Alert.alert(
      `Delete ${candidate.name}?`,
      "This cannot be undone if the candidate has no votes recorded.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest(
                `/admin/candidates/${selectedConstituency.id}/${candidate.id}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${userData.token}` },
                },
              );
              setCandidates((prev) =>
                prev.filter((cand) => cand.id !== candidate.id),
              );
            } catch (err) {
              Alert.alert("Cannot Delete", err.message);
            }
          },
        },
      ],
    );
  };

  const { execute: executeInit, errorType: initErrorType } =
    useNetworkRequest();
  const { execute: executeCandidates, loading: loadingCandidates } =
    useNetworkRequest();
  const {
    execute: executeCreate,
    loading: creating,
    error: createError,
    clearError,
  } = useNetworkRequest();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const result = await executeInit(async () => {
      const [constituenciesRes, partiesRes, electionRes] = await Promise.all([
        adminRequest("/admin/constituencies", userData.token),
        adminRequest("/admin/parties", userData.token),
        adminRequest("/admin/election", userData.token),
      ]);
      return { constituenciesRes, partiesRes, electionRes };
    });

    if (result.success) {
      setConstituencies(result.data.constituenciesRes.constituencies);
      setParties(
        result.data.partiesRes.parties.filter((p) => p.status === "active"),
      );

      // Candidates can only be changed while no House of Representatives election is open.
      // Checking this proactively avoids the admin discovering the 409 only after filling the form.
      const election = result.data.electionRes.election;
      setOpenElection(election.status === "open" ? election : null);
    }
  };

  const handleSelectConstituency = async (constituency) => {
    setSelectedConstituency(constituency);
    setCandidates(null);

    const result = await executeCandidates(async () => {
      return await adminRequest(
        `/admin/candidates?constituencyId=${constituency.id}`,
        userData.token,
      );
    });

    if (result.success) {
      setCandidates(result.data.candidates);
    }
  };

  const handleAddCandidate = async () => {
    const isEditing = Boolean(editingCandidate);
    const fullCandidateName = `${surname.trim()} ${firstName.trim()}`.trim();

    const result = await executeCreate(async () => {
      if (isEditing) {
        return await adminRequest(
          `/admin/candidates/${selectedConstituency.id}/${editingCandidate.id}`,
          userData.token,
          {
            method: "PATCH",
            body: JSON.stringify({ name: fullCandidateName, party }),
          },
        );
      }
      return await adminRequest("/admin/candidates", userData.token, {
        method: "POST",
        body: JSON.stringify({
          name: fullCandidateName,
          party,
          constituencyId: selectedConstituency.id,
        }),
      });
    });

    if (result.success) {
      setSurname("");
      setFirstName("");
      setParty("");
      setEditingCandidate(null);
      handleSelectConstituency(selectedConstituency);
    }
  };

  if (initErrorType === "network" && !constituencies) {
    return <NetworkErrorState onRetry={loadInitialData} />;
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
        <Text style={[typography.h1, styles.title]}>Candidates</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Select a constituency to view and add its candidates.
        </Text>

        {openElection && (
          <View style={styles.lockedNotice}>
            <Text style={styles.lockedTitle}>Candidates Locked</Text>
            <Text style={styles.lockedText}>
              "{openElection.name}" is currently open. Candidates cannot be
              added, edited, or removed until it closes.
            </Text>
          </View>
        )}

        {constituencies && (
          <SelectField
            label="Constituency"
            placeholder="Select a constituency"
            value={selectedConstituency?.name || ""}
            options={constituencies.map((c) => c.name)}
            onSelect={(name) => {
              const found = constituencies.find((c) => c.name === name);
              handleSelectConstituency(found);
            }}
          />
        )}

        {selectedConstituency && (
          <>
            {!openElection && (
              <View style={styles.formCard}>
                {createError && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{createError}</Text>
                  </View>
                )}
                <View style={{ flexDirection: "row", gap: spacing.sm }}>
                  <View style={{ flex: 1 }}>
                    <CustomInput
                      label="Surname"
                      placeholder="Surname"
                      value={surname}
                      onChangeText={(text) => {
                        setSurname(text);
                        clearError();
                      }}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <CustomInput
                      label="First Name"
                      placeholder="First name"
                      value={firstName}
                      onChangeText={(text) => {
                        setFirstName(text);
                        clearError();
                      }}
                    />
                  </View>
                </View>
                {parties && (
                  <SelectField
                    label="Party"
                    placeholder="Select party"
                    value={party}
                    options={parties.map((p) => p.code)}
                    onSelect={(code) => {
                      setParty(code);
                      clearError();
                    }}
                  />
                )}
                <CustomButton
                  title={editingCandidate ? "Save Changes" : "Add Candidate"}
                  variant="outline"
                  onPress={handleAddCandidate}
                  loading={creating}
                  disabled={
                    !surname.trim() || !firstName.trim() || !party || creating
                  }
                />

                {editingCandidate && (
                  <CustomButton
                    title="Cancel Edit"
                    variant="outline"
                    onPress={() => {
                      setEditingCandidate(null);
                      setSurname("");
                      setFirstName("");
                      setParty("");
                    }}
                    style={{ marginTop: spacing.xs }}
                  />
                )}
              </View>
            )}

            <Text style={styles.sectionLabel}>
              {candidates
                ? `${candidates.length} Candidate${candidates.length === 1 ? "" : "s"}`
                : "Candidates"}
            </Text>

            {loadingCandidates && (
              <Text style={styles.loadingText}>Loading candidates…</Text>
            )}

            {candidates && candidates.length === 0 && !openElection && (
              <View style={styles.warningNotice}>
                <Text style={styles.warningText}>
                  This constituency has no candidates yet. An election cannot
                  open until every constituency has at least one.
                </Text>
              </View>
            )}

            {candidates && candidates.length === 0 && openElection && (
              <Text style={styles.emptyText}>
                This constituency has no candidates.
              </Text>
            )}

            {candidates && candidates.length > 0 && (
              <View style={styles.list}>
                {candidates.map((c) => (
                  <View key={c.id} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{c.name}</Text>
                      <Text style={styles.rowMeta}>{c.party}</Text>
                    </View>

                    {!openElection && (
                      <View style={styles.rowActions}>
                        <TouchableOpacity
                          onPress={() => handleEditCandidate(c)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleDeleteCandidate(c)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.removeText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
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
  lockedNotice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F0DDA0",
    marginBottom: spacing.lg,
  },
  lockedTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.warning,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  lockedText: { fontSize: 13, lineHeight: 19, color: "#7A5A10" },
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginVertical: spacing.md,
  },
  errorBanner: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "#FDECEB",
    borderWidth: 1,
    borderColor: "#E8C0BC",
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.error,
    lineHeight: 19,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
  warningNotice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F0DDA0",
    marginBottom: spacing.md,
  },
  warningText: { fontSize: 13, lineHeight: 19, color: "#7A5A10" },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
  list: { marginBottom: spacing.md },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  rowName: { fontSize: 14, fontWeight: "800", color: colors.text },
  rowMeta: { fontSize: 12, fontWeight: "700", color: colors.textMuted },
  rowActions: {
    flexDirection: "row",
    gap: spacing.md,
  },

  editText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },
  removeText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.error,
  },
});

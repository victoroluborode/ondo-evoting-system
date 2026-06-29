import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import NetworkErrorState from "../../components/NetworkErrorState";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography, radius } from "../../theme";
import { apiRequest } from "../../services/api";

export default function PartyManagementScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const [parties, setParties] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const { execute, loading, errorType } = useNetworkRequest();

  const [editingParty, setEditingParty] = useState(null);

  const handleEditParty = (party) => {
    setEditingParty(party);
    setName(party.name);
    setCode(party.code);
  };

  const handleDeleteParty = (party) => {
    Alert.alert(
      `Delete ${party.name}?`,
      "This can only be removed if no candidates are assigned to it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequest(`/admin/parties/${party.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${userData.token}` },
              });
              setParties((prev) => prev.filter((p) => p.id !== party.id));
            } catch (err) {
              Alert.alert("Cannot Delete", err.message);
            }
          },
        },
      ],
    );
  };

  const {
    execute: executeCreate,
    loading: creating,
    error: createError,
    clearError,
  } = useNetworkRequest();

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    const result = await execute(async () => {
      return await adminRequest("/admin/parties", userData.token);
    });

    if (result.success) {
      setParties(result.data.parties);
    }
  };

  const handleCreate = async () => {
    const isEditing = Boolean(editingParty);

    const result = await executeCreate(async () => {
      if (isEditing) {
        return await adminRequest(
          `/admin/parties/${editingParty.id}`,
          userData.token,
          {
            method: "PATCH",
            body: JSON.stringify({ name: name.trim(), code: code.trim() }),
          },
        );
      }
      return await adminRequest("/admin/parties", userData.token, {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), code: code.trim() }),
      });
    });

    if (result.success) {
      setName("");
      setCode("");
      setEditingParty(null);
      loadParties();
    }
  };

  if (errorType === "network" && !parties) {
    return <NetworkErrorState onRetry={loadParties} />;
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
        <Text style={[typography.h1, styles.title]}>Political Parties</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Parties must be active before candidates can be assigned to them.
        </Text>

        <View style={styles.formCard}>
          {createError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{createError}</Text>
            </View>
          )}
          <CustomInput
            label="Party Name"
            placeholder="e.g. All Progressives Congress"
            value={name}
            onChangeText={(text) => {
              setName(text);
              clearError();
            }}
          />
          <CustomInput
            label="Party Code"
            placeholder="e.g. APC"
            autoCapitalize="characters"
            value={code}
            onChangeText={(text) => {
              setCode(text);
              clearError();
            }}
          />
          <CustomButton
            title={editingParty ? "Save Changes" : "Add Party"}
            variant="outline"
            onPress={handleCreate}
            loading={creating}
            disabled={!name.trim() || !code.trim() || creating}
          />

          {editingParty && (
            <CustomButton
              title="Cancel Edit"
              variant="outline"
              onPress={() => {
                setEditingParty(null);
                setName("");
                setCode("");
              }}
              style={{ marginTop: spacing.xs }}
            />
          )}
        </View>

        <Text style={styles.sectionLabel}>
          {parties
            ? `${parties.length} Part${parties.length === 1 ? "y" : "ies"}`
            : "Parties"}
        </Text>

        {loading && !parties && (
          <Text style={styles.loadingText}>Loading parties…</Text>
        )}

        {parties && (
          <View style={styles.list}>
            {parties.map((party) => (
              <View key={party.id} style={styles.row}>
                <View style={styles.rowTextWrap}>
                  <Text style={styles.rowName}>{party.name}</Text>
                  <Text style={styles.rowMeta}>{party.code}</Text>
                </View>

                <View
                  style={[
                    styles.statusTag,
                    party.status !== "active" && styles.statusTagInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      party.status !== "active" && styles.statusTextInactive,
                    ]}
                  >
                    {party.status === "active" ? "Active" : "Inactive"}
                  </Text>
                </View>

                <View style={styles.rowActions}>
                  <TouchableOpacity
                    onPress={() => handleEditParty(party)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleDeleteParty(party)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
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
    gap: spacing.sm,
  },
  rowTextWrap: { flex: 1 },
  rowName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  rowMeta: { fontSize: 12, color: colors.textMuted },
  statusTag: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusTagInactive: {
    backgroundColor: colors.background,
    borderColor: colors.border,
  },
  statusText: { fontSize: 11, fontWeight: "800", color: colors.primary },
  statusTextInactive: { color: colors.textMuted },
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

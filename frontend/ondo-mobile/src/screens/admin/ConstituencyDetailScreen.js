import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography, radius } from "../../theme";

export default function ConstituencyDetailScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const { constituency } = route.params;
  const [name, setName] = useState(constituency.name);
  const [lgas, setLgas] = useState(constituency.lgas || []);
  const [newLgaName, setNewLgaName] = useState("");

  const {
    execute: executeUpdate,
    loading: updating,
    error: updateError,
    clearError: clearUpdateError,
  } = useNetworkRequest();
  const {
    execute: executeAddLga,
    loading: addingLga,
    error: addLgaError,
    clearError: clearAddLgaError,
  } = useNetworkRequest();

  const handleSaveName = async () => {
    const result = await executeUpdate(async () => {
      return await adminRequest(
        `/admin/constituencies/${constituency.id}`,
        userData.token,
        {
          method: "PATCH",
          body: JSON.stringify({ name: name.trim() }),
        },
      );
    });

    if (result.success) {
      Alert.alert("Saved", "Constituency name updated.");
    }
  };

  const handleAddLga = async () => {
    const result = await executeAddLga(async () => {
      return await adminRequest("/admin/lgas", userData.token, {
        method: "POST",
        body: JSON.stringify({
          name: newLgaName.trim(),
          constituencyId: constituency.id,
        }),
      });
    });

    if (result.success) {
      setLgas((prev) => [...prev, result.data.lga]);
      setNewLgaName("");
    }
  };

  const handleDeleteLga = (lga) => {
    Alert.alert(
      `Delete ${lga.name}?`,
      "This can only be removed if no voters are registered under it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { apiRequest } = await import("../../services/api");
              await apiRequest(`/admin/lgas/${lga.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${userData.token}` },
              });
              setLgas((prev) => prev.filter((l) => l.id !== lga.id));
            } catch (err) {
              Alert.alert("Cannot Delete", err.message);
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>{constituency.name}</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          {constituency.code}
        </Text>

        {updateError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{updateError}</Text>
          </View>
        )}

        <CustomInput
          label="Constituency Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            clearUpdateError();
          }}
        />
        <CustomButton
          title="Save Name"
          variant="outline"
          onPress={handleSaveName}
          loading={updating}
          disabled={!name.trim() || name === constituency.name || updating}
        />

        <Text style={styles.sectionLabel}>
          {lgas.length} Local Government Area{lgas.length === 1 ? "" : "s"}
        </Text>

        <View style={styles.list}>
          {lgas.map((lga) => (
            <View key={lga.id} style={styles.row}>
              <Text style={styles.rowText}>{lga.name}</Text>
              <TouchableOpacity
                onPress={() => handleDeleteLga(lga)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.addLgaCard}>
          {addLgaError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{addLgaError}</Text>
            </View>
          )}
          <CustomInput
            label="New LGA Name"
            placeholder="e.g. Akure Central"
            value={newLgaName}
            onChangeText={(text) => {
              setNewLgaName(text);
              clearAddLgaError();
            }}
          />
          <CustomButton
            title="Add LGA"
            variant="outline"
            onPress={handleAddLga}
            loading={addingLga}
            disabled={!newLgaName.trim() || addingLga}
          />
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
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  list: { marginBottom: spacing.lg },
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
  rowText: { fontSize: 14, fontWeight: "700", color: colors.text },
  removeText: { fontSize: 13, fontWeight: "700", color: colors.error },
  addLgaCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
  },
});

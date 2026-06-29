import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useNetworkRequest } from "../../hooks/useNetworkRequest";
import { adminRequest } from "../../services/adminApi";
import { colors, spacing, typography } from "../../theme";

export default function CreateElectionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { userData } = useContext(AuthContext);
  const [name, setName] = useState("");
  const { execute, loading, error, clearError } = useNetworkRequest();

  const handleCreate = async () => {
    const result = await execute(async () => {
      return await adminRequest("/admin/elections", userData.token, {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          electionType: "house_of_representatives",
          status: "draft",
        }),
      });
    });

    if (result.success) {
      navigation.replace("ElectionDetail", {
        electionId: result.data.election.id,
      });
    }
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
        <Text style={[typography.h1, styles.title]}>Create Election</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          New elections start as drafts. You can configure dates and candidates
          before opening it.
        </Text>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <CustomInput
          label="Election Name"
          placeholder="e.g. House of Representatives Elections 2027"
          value={name}
          onChangeText={(text) => {
            setName(text);
            clearError();
          }}
        />

        <CustomButton
          title="Create Draft Election"
          onPress={handleCreate}
          loading={loading}
          disabled={!name.trim() || loading}
          style={{ marginTop: spacing.sm }}
        />
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
    borderRadius: 12,
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
});

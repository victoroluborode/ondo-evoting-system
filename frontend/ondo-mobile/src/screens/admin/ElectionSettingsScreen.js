// ElectionSettingsScreen.js — new
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography } from "../../theme";

export default function ElectionSettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    name: "Ondo State House of Representatives Election 2027",
    electionDate: "",
    type: "House of Representatives",
  });

  const handleSave = () => {
    navigation.goBack();
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
        <Text style={[typography.h1, styles.title]}>Election Settings</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Basic information for this election session.
        </Text>

        <CustomInput
          label="Election Name"
          placeholder="e.g. Ondo State House of Reps Election 2027"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />
        <CustomInput
          label="Election Date"
          placeholder="DD/MM/YYYY"
          value={form.electionDate}
          onChangeText={(text) => setForm({ ...form, electionDate: text })}
        />
        <CustomInput
          label="Election Type"
          placeholder="e.g. House of Representatives"
          value={form.type}
          onChangeText={(text) => setForm({ ...form, type: text })}
        />

        <CustomButton
          title="Save Settings"
          onPress={handleSave}
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
});

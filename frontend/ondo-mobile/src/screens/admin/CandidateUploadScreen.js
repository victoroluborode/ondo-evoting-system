// CandidateUploadScreen.js — new
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import SelectField from "../../components/SelectField";
import { ONDO_CONSTITUENCIES } from "../../constants/locations";
import { colors, spacing, typography, radius } from "../../theme";

const PARTIES = ["APC", "PDP", "LP", "NNPP", "Other"];

export default function CandidateUploadScreen() {
  const insets = useSafeAreaInsets();
  const [candidates, setCandidates] = useState([
    { id: "1", name: "Adewale Adeleke", party: "APC", constituency: "Akure" },
    { id: "2", name: "Olumide Bakare", party: "PDP", constituency: "Akure" },
  ]);
  const [form, setForm] = useState({ name: "", party: "", constituency: "" });

  const isFormValid = form.name && form.party && form.constituency;

  const handleAdd = () => {
    setCandidates((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    setForm({ name: "", party: "", constituency: "" });
  };

  const handleRemove = (id) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
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
        <Text style={[typography.h1, styles.title]}>Upload Candidates</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Add every candidate contesting in this election.
        </Text>

        <View style={styles.formCard}>
          <CustomInput
            label="Candidate Name"
            placeholder="Full name"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />
          <SelectField
            label="Party"
            placeholder="Select party"
            value={form.party}
            options={PARTIES}
            onSelect={(party) => setForm({ ...form, party })}
          />
          <SelectField
            label="Constituency"
            placeholder="Select constituency"
            value={form.constituency}
            options={ONDO_CONSTITUENCIES.map((c) => c.name)}
            onSelect={(constituency) => setForm({ ...form, constituency })}
          />
          <CustomButton
            title="Add Candidate"
            variant="outline"
            onPress={handleAdd}
            disabled={!isFormValid}
          />
        </View>

        <Text style={styles.sectionLabel}>
          {candidates.length} Candidate{candidates.length === 1 ? "" : "s"}{" "}
          Added
        </Text>

        <View style={styles.candidateList}>
          {candidates.map((c) => (
            <View key={c.id} style={styles.candidateRow}>
              <View style={styles.candidateTextWrap}>
                <Text style={styles.candidateName}>{c.name}</Text>
                <Text style={styles.candidateMeta}>
                  {c.party} · {c.constituency}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(c.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          {candidates.length === 0 && (
            <Text style={styles.emptyText}>No candidates added yet.</Text>
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
  formCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  candidateList: { marginBottom: spacing.md },
  candidateRow: {
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
  candidateTextWrap: { flex: 1 },
  candidateName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  candidateMeta: { fontSize: 12, color: colors.textMuted },
  removeText: { fontSize: 13, fontWeight: "700", color: colors.error },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.md,
  },
});

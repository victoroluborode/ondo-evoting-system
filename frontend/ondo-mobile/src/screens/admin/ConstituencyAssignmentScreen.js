// ConstituencyAssignmentScreen.js — new (confirmation, not free selection — see reasoning below)
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { ONDO_CONSTITUENCIES } from "../../constants/locations";
import { colors, spacing, typography, radius } from "../../theme";

export default function ConstituencyAssignmentScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [confirmed, setConfirmed] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[typography.h1, styles.title]}>
          Confirm Constituencies
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          This election runs across all {ONDO_CONSTITUENCIES.length} Federal
          Constituencies of Ondo State.
        </Text>

        <View style={styles.list}>
          {ONDO_CONSTITUENCIES.map((c) => (
            <View key={c.name} style={styles.row}>
              <Text style={styles.rowName}>{c.name}</Text>
              <View style={styles.includedTag}>
                <Text style={styles.includedText}>Included</Text>
              </View>
            </View>
          ))}
        </View>

        <CustomButton
          title={confirmed ? "Confirmed" : "Confirm Coverage"}
          onPress={() => {
            setConfirmed(true);
            setTimeout(() => navigation.goBack(), 800);
          }}
          disabled={confirmed}
          style={{ marginTop: spacing.lg }}
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
  rowName: { fontSize: 14, fontWeight: "700", color: colors.text },
  includedTag: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  includedText: { fontSize: 11, fontWeight: "800", color: colors.primary },
});

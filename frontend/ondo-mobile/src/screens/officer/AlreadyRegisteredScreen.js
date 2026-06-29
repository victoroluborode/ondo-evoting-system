import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

export default function AlreadyRegisteredScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { fullName, vin } = route.params;

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>!</Text>
        </View>
        <Text style={[typography.h1, styles.title]}>Already Registered</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          {fullName} ({vin}) already has a voter account. They don't need to
          register again.
        </Text>
        <CustomButton
          title="Check Another VIN"
          onPress={() => navigation.navigate("VinCheck")}
        />
        <CustomButton
          title="Return to Dashboard"
          variant="outline"
          onPress={() => navigation.navigate("Dashboard")}
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF8E7",
    borderWidth: 1.5,
    borderColor: "#F0DDA0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 28, color: colors.warning, fontWeight: "900" },
  title: { textAlign: "center", marginBottom: spacing.sm },
  subtitle: { textAlign: "center", marginBottom: spacing.xl },
});

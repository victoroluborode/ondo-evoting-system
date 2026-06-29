import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomButton from "../../components/CustomButton";
import { colors, spacing, typography, radius } from "../../theme";

export default function AlreadyVotedScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>
        <Text style={[typography.h1, styles.title]}>You've Already Voted</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Our records show you've already cast your vote in this election. Each
          voter may only vote once.
        </Text>
        <CustomButton
          title="Back to Sign In"
                  onPress={() => navigation.dispatch(
                      CommonActions.reset({
                        index: 0,
                        routes: [{name: "VoterLogin"}],
                      })
                  )}
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
    backgroundColor: colors.primaryDim,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 28, color: colors.primary, fontWeight: "900" },
  title: { textAlign: "center", marginBottom: spacing.sm },
  subtitle: { textAlign: "center", marginBottom: spacing.xl },
});

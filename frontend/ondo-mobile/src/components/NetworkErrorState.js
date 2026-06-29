import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomButton from "./CustomButton";
import { colors, spacing, typography, radius } from "../theme";

export default function NetworkErrorState({ onRetry }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>!</Text>
      </View>
      <Text style={[typography.h2, styles.title]}>No Connection</Text>
      <Text style={[typography.subtitle, styles.subtitle]}>
        This page needs an internet connection to load. Check your network and
        try again.
      </Text>
      {onRetry && (
        <CustomButton
          title="Try Again"
          onPress={onRetry}
          style={{ width: "100%" }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryDim,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.primary,
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
});

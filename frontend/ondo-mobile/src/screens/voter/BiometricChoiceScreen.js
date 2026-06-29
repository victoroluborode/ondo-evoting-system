import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, typography, radius } from "../../theme";

export default function BiometricChoiceScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Text style={[typography.h1, styles.title]}>Verify Identity</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Access is granted on successful verification from either method —
          fingerprint or facial recognition.
        </Text>

        <View style={styles.methodList}>
          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("FingerprintVerification")}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>⌾</Text>
            </View>
            <View style={styles.methodTextWrap}>
              <Text style={styles.methodTitle}>Fingerprint Scan</Text>
              <Text style={styles.methodSubtitle}>
                Use the device hardware sensor
              </Text>
            </View>
            <Text style={styles.methodArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("FaceVerification")}
          >
            <View style={styles.methodIcon}>
              <Text style={styles.methodIconText}>◎</Text>
            </View>
            <View style={styles.methodTextWrap}>
              <Text style={styles.methodTitle}>Facial Recognition</Text>
              <Text style={styles.methodSubtitle}>
                On-device camera pipeline
              </Text>
            </View>
            <Text style={styles.methodArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Voters with worn fingerprints may proceed directly to facial
            recognition.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  methodList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.lg,
  },
  methodRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconText: {
    fontSize: 22,
    color: colors.primary,
  },
  methodTextWrap: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 2,
  },
  methodSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
  methodArrow: {
    fontSize: 18,
    color: colors.textLight,
    fontWeight: "300",
  },
  notice: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMid,
  },
});

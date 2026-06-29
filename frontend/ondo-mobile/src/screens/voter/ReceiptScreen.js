import React, { useContext, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import CustomButton from "../../components/CustomButton";
import { AuthContext } from "../../context/AuthContext";
import { colors, spacing, typography, radius } from "../../theme";

export default function ReceiptScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { logout } = useContext(AuthContext);
  const { receiptCode } = route.params || {};
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!receiptCode) return;
    await Clipboard.setStringAsync(receiptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={[typography.h1, styles.title]}>
          Vote Cast Successfully
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Your vote has been received. Save your receipt code below — you can
          verify it any time from the sign-in screen, without logging in.
        </Text>

        <View style={styles.receiptBox}>
          <Text style={styles.receiptLabel}>Receipt Code</Text>
          <Text style={styles.receiptHash} selectable>
            {receiptCode || "Unavailable"}
          </Text>

          <TouchableOpacity
            onPress={handleCopy}
            style={styles.copyRow}
            activeOpacity={0.7}
          >
            <Text style={styles.copyText}>
              {copied ? "Copied!" : "Copy Code"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />
          <Text style={styles.receiptNote}>
            This code confirms that a ballot was submitted. It does not reveal
            who you voted for.
          </Text>
        </View>

        <CustomButton title="Exit & Sign Out" onPress={logout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.lg, justifyContent: "center" },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryDim,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  icon: { color: colors.primary, fontSize: 28, fontWeight: "900" },
  title: { textAlign: "center", marginBottom: spacing.sm },
  subtitle: { textAlign: "center", marginBottom: spacing.xl },
  receiptBox: {
    backgroundColor: colors.surface,
    borderStyle: "dashed",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.textMuted,
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  receiptHash: {
    fontSize: 13,
    fontFamily: "monospace",
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginVertical: spacing.md,
    letterSpacing: 0.3,
  },
  copyRow: {
    alignSelf: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginBottom: spacing.sm,
  },
  copyText: { fontSize: 12, fontWeight: "800", color: colors.primary },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  receiptNote: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useContext } from "react";
import CustomButton from "../../components/CustomButton";
import { AuthContext } from "../../context/AuthContext";
import { colors, spacing, typography, radius } from "../../theme";
import { Ionicons } from "@expo/vector-icons";

export default function OfflineVoteQueuedScreen({ route }) {
  const insets = useSafeAreaInsets();
  const { logout } = useContext(AuthContext);
  const { offlineVoteId } = route.params || {};

  return (
    <View style={styles.container}>
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <View style={styles.iconCircle}>
          <Ionicons
            name="cloud-upload-outline"
            size={32}
            color={colors.warning}
          />
        </View>
        <Text style={[typography.h1, styles.title]}>
          Vote Saved on This Device
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          We couldn't reach the server, so your vote has been saved securely on
          this device. It will be submitted automatically the next time you have
          a connection.
        </Text>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            Keep this app installed and open it again once you're back online to
            finish submitting your vote. Once submitted, you can confirm your
            vote was recorded at any time using the "Verify a Vote Receipt"
            option on the sign-in screen — your vote's receipt code will also
            appear automatically if you sign back into this account.
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
    backgroundColor: "#FFF8E7",
    borderWidth: 1.5,
    borderColor: "#F0DDA0",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 28, color: colors.warning, fontWeight: "900" },
  title: { textAlign: "center", marginBottom: spacing.sm },
  subtitle: { textAlign: "center", marginBottom: spacing.lg },
  noticeBox: {
    padding: spacing.base,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMid,
    textAlign: "center",
  },
});

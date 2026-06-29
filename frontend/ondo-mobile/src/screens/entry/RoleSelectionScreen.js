import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { colors, spacing, radius, typography } from "../../theme";

const ROLES = [
  {
    key: "voter",
    label: "Voter",
    description: "Accreditation & ballot access",
    detail: "For registered voters casting a ballot",
    route: "VoterLogin",
  },
  {
    key: "officer",
    label: "Electoral Officer",
    description: "Voter registration & enrolment",
    detail: "For field officers enrolling new voters",
    route: "OfficerLogin",
  },
  {
    key: "admin",
    label: "System Admin",
    description: "Election setup & result collation",
    detail: "For election administrators only",
    route: "AdminLogin",
  },
];

export default function RoleSelectionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <Text style={typography.label}>Welcome</Text>
        <Text style={[typography.h1, styles.title]}>Select your portal</Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          Choose your operational role to continue to the correct system
          gateway.
        </Text>
      </View>

      <View style={styles.roleList}>
        {ROLES.map((role, index) => (
          <TouchableOpacity
            key={role.key}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(role.route)}
            style={styles.roleRow}
          >
            <View style={styles.roleIndex}>
              <Text style={styles.roleIndexText}>
                {String(index + 1).padStart(2, "0")}
              </Text>
            </View>

            <View style={styles.roleTextWrap}>
              <Text style={styles.roleLabel}>{role.label}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
              <Text style={styles.roleDetail}>{role.detail}</Text>
            </View>

            <Text style={styles.roleArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>
          All sessions are logged and audited.{"\n"}Unauthorised access is
          prohibited.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  title: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  subtitle: {
    maxWidth: "92%",
  },
  roleList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  roleIndex: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    alignItems: "center",
    justifyContent: "center",
  },
  roleIndexText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  roleTextWrap: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 3,
  },
  roleDescription: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 2,
  },
  roleDetail: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  roleArrow: {
    fontSize: 20,
    color: colors.textLight,
    fontWeight: "300",
    marginLeft: spacing.xs,
  },
  footer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footerDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    textAlign: "center",
  },
});

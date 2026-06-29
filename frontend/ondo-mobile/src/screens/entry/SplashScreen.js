import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, StatusBar } from "react-native";
import { colors, spacing } from "../../theme";

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => navigation.replace("RoleSelection"), 1500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <Animated.View
        style={{ opacity, transform: [{ translateY }], alignItems: "center" }}
      >
        <View style={styles.mark}>
          <View style={styles.markInnerLine} />
          <View style={[styles.markInnerLine, styles.markInnerLineShort]} />
        </View>
        <Text style={styles.appName}>ONDO e-VOTE</Text>
        <Text style={styles.tagline}>Bimodal Multi-Constituency Platform</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.footerRule} />
        <Text style={styles.footerText}>Federal Republic of Nigeria</Text>
        <Text style={styles.footerSub}>NDPR Compliant</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  mark: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.ml,
    gap: 6,
  },
  markInnerLine: {
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.white,
  },
  markInnerLineShort: {
    width: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.white,
    letterSpacing: 5,
    marginBottom: spacing.xs,
  },
  tagline: {
    maxWidth: 220,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  footer: {
    position: "absolute",
    bottom: spacing.xxl,
    alignItems: "center",
  },
  footerRule: {
    width: 28,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.5,
  },
  footerSub: {
    fontSize: 10,
    color: "rgba(255,255,255,0.35)",
    marginTop: 2,
    letterSpacing: 0.5,
  },
});

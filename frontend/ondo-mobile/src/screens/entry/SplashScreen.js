import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { colors, spacing } from '../../theme';

export default function SplashScreen({ navigation }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => navigation.replace('RoleSelection'), 1600);
    });
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <Animated.View style={{ opacity, transform: [{ translateY }], alignItems: 'center' }}>
        <View style={styles.logoRing}>
          <Text style={styles.logoEmoji}>▣</Text>
        </View>
        <Text style={styles.appName}>ONDO e-VOTE</Text>
        <Text style={styles.tagline}>Bimodal Multi-Constituency Platform</Text>
      </Animated.View>
      <Text style={styles.inec}>Federal Republic of Nigeria · NDPR Compliant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoRing: {
    width: 58,
    height: 58,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  logoEmoji: { fontSize: 28, color: colors.white, fontWeight: '900' },
  appName: { fontSize: 25, fontWeight: '900', color: colors.white, letterSpacing: 5, marginBottom: 8 },
  tagline: {
    maxWidth: 210,
    textAlign: 'center',
    fontSize: 10,
    color: 'rgba(255,255,255,0.56)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  inec: {
    position: 'absolute',
    bottom: 34,
    fontSize: 10,
    color: 'rgba(255,255,255,0.38)',
    letterSpacing: 1,
  },
});

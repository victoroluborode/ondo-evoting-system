import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

export default function OfflineBanner({ isOffline }) {
  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Offline Mode Active - Data will sync automatically</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: colors.white, fontSize: 12, fontWeight: '700' },
});

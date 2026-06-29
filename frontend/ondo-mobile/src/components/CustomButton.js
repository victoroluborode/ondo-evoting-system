import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const isOutline = variant === 'outline';

  // Keeps all app buttons visually consistent across role flows.
  const getBgColor = () => {
    if (disabled) return colors.border;
    if (isOutline) return 'transparent';
    if (variant === 'secondary') return colors.background;
    if (variant === 'danger') return colors.errorTint;
    return colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return colors.textMuted;
    if (variant === 'danger') return colors.error;
    if (isOutline || variant === 'secondary') return colors.primary;
    return colors.white;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBgColor() },
        isOutline && styles.outlineBorder,
        variant === 'secondary' && styles.secondaryBorder,
        variant === 'danger' && styles.dangerBorder,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[typography.button, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 58,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
  },
  outlineBorder: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerBorder: {
    borderWidth: 1,
    borderColor: '#E8C0BC',
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export default function CustomInput({
  label,
  error,
  ...props
}) {
  const isPassword = Boolean(props.secureTextEntry);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputShell,
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          {...props}
          secureTextEntry={isPassword && !passwordVisible}
        />
        {isPassword ? (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setPasswordVisible((visible) => !visible)}
            activeOpacity={0.75}
          >
            <Text style={styles.eyeText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.ml },
  label: {
    ...typography.label,
    color: colors.textMid,
    marginBottom: spacing.xs,
  },
  inputShell: {
    minHeight: 58,
    borderWidth: 1.6,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 56,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4 },
  eyeButton: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
});

import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { colors, spacing, typography } from '../../theme';

export default function AccessDeniedScreen() {
  const { logout } = useContext(AuthContext);

  // Clears potentially invalid role/session state and returns to entry flow.
  const handleReturn = () => {
    logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🛑</Text>
        </View>

        <Text style={[typography.h1, styles.title]}>
          Access Denied
        </Text>
        <Text style={[typography.subtitle, styles.subtitle]}>
          You do not have the required Role-Based Access Control (RBAC) permissions to view this module. This attempt has been logged in the audit trail.
        </Text>

        <CustomButton
          title="Return to Secure Gateway"
          onPress={handleReturn}
          variant="primary"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, flex: 1, justifyContent: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 36 },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { textAlign: 'center', marginBottom: spacing.xl },
});

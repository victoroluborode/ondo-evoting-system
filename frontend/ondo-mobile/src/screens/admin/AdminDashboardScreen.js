import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import CustomButton from '../../components/CustomButton';
import { ScreenHeader, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing } from '../../theme';

export default function AdminDashboardScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  const modules = [
    { title: 'Election Management', icon: '⚙️', sub: 'Configure settings, upload candidates', route: 'ElectionMgmt' },
    { title: 'Voter Management', icon: '👥', sub: 'Verify records, detect duplicates', route: 'Dashboard' },
    { title: 'Constituency Management', icon: '🗺️', sub: 'Configure partitions, manage LGAs', route: 'Dashboard' },
    { title: 'Election Monitoring', icon: '📊', sub: 'Offline sync health, detect anomalies', route: 'OfflineSync' },
    { title: 'Result Collation', icon: '📈', sub: 'Verify vote integrity, collate results', route: 'ResultCollation' },
    { title: 'Audit & Security', icon: '🛡️', sub: 'View logs, backup encrypted records', route: 'Dashboard' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader
          title="System Modules"
          subtitle="Select a module to manage the electoral lifecycle."
          chip="Admin"
        />

        <View style={styles.grid}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.title}
              style={styles.card}
              onPress={() => navigation.navigate(module.route)}
            >
              <Text style={styles.cardIcon}>{module.icon}</Text>
              <Text style={styles.cardTitle}>{module.title}</Text>
              <Text style={styles.cardSub}>{module.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton
          title="Terminate Admin Session"
          variant="outline"
          onPress={logout}
          style={{ marginTop: spacing.xxl }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  content: { padding: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 15,
    marginBottom: spacing.sm,
  },
  cardTitle: { fontSize: 13, fontWeight: '800', color: colors.text, marginBottom: 6 },
  cardSub: { fontSize: 10.5, color: colors.textMuted, lineHeight: 16 },
});

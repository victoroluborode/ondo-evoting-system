import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { StatusChip, sharedStyles } from '../../components/DesignSystem';
import { colors, spacing, typography } from '../../theme';

export default function BallotScreen({ navigation }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const constituency = 'Akure North / Akure South Constituency';
  const candidates = [
    { id: '1', name: 'Adewale Adeleke', party: 'APC' },
    { id: '2', name: 'Olumide Bakare', party: 'PDP' },
    { id: '3', name: 'Chidi Obi', party: 'LP' },
    { id: '4', name: 'Musa Danjuma', party: 'NNPP' },
  ];

  // Passes the selected candidate into the immutable review step.
  const handleSelection = () => {
    if (!selectedCandidate) return;
    const candidateData = candidates.find((candidate) => candidate.id === selectedCandidate);
    navigation.navigate('VoteReview', { candidate: candidateData });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>{constituency}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.h1}>Official Ballot</Text>
        <Text style={[typography.subtitle, styles.subtitleSpacing]}>
          Select one candidate for House of Representatives.
        </Text>

        {candidates.map((candidate) => (
          <TouchableOpacity
            key={candidate.id}
            style={[
              styles.row,
              selectedCandidate === candidate.id && styles.rowSelected,
            ]}
            onPress={() => setSelectedCandidate(candidate.id)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={styles.candName}>{candidate.name}</Text>
              <StatusChip label={candidate.party} />
            </View>
            <View style={[
              styles.radio,
              selectedCandidate === candidate.id && styles.radioActive,
            ]} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title="Review Selection"
          disabled={!selectedCandidate}
          onPress={handleSelection}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.screen,
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryDim,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.primaryBorder,
  },
  badgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary },
  badgeText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  content: { padding: spacing.md, paddingBottom: 100 },
  subtitleSpacing: { marginTop: spacing.xs, marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.2,
    borderColor: colors.border,
    padding: spacing.base,
    borderRadius: 10,
    marginBottom: spacing.sm,
  },
  rowSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  candName: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
});

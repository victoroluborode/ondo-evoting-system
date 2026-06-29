import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing, radius } from "../../theme";

const MOCK_REGISTRATIONS = [
  {
    id: "1",
    name: "Folasade Ogunleye",
    constituency: "Akure",
    lga: "Akure South",
    time: "9:42 AM",
    uploaded: true,
  },
  {
    id: "2",
    name: "Tunde Bakare",
    constituency: "Akure",
    lga: "Akure South",
    time: "10:15 AM",
    uploaded: true,
  },
  {
    id: "3",
    name: "Chiamaka Eze",
    constituency: "Akure",
    lga: "Akure North",
    time: "11:03 AM",
    uploaded: false,
  },
  {
    id: "4",
    name: "Ibrahim Yusuf",
    constituency: "Akure",
    lga: "Akure South",
    time: "11:47 AM",
    uploaded: false,
  },
];

export default function MyRegistrationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        data={MOCK_REGISTRATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.headerSubtitle}>
            Everyone you've registered today, with their save status.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowMeta}>
                {item.lga} LGA · {item.constituency} Constituency
              </Text>
              <Text style={styles.rowTime}>{item.time}</Text>
            </View>
            <View
              style={[
                styles.statusTag,
                item.uploaded ? styles.statusSaved : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  item.uploaded
                    ? styles.statusTextSaved
                    : styles.statusTextPending,
                ]}
              >
                {item.uploaded ? "Saved" : "Waiting to upload"}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No registrations yet today.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  rowTextWrap: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 3,
  },
  rowMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 2,
  },
  rowTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statusTag: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 2,
  },
  statusSaved: {
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  statusPending: {
    backgroundColor: "#FFF8E7",
    borderWidth: 1,
    borderColor: "#F0DDA0",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },
  statusTextSaved: {
    color: colors.primary,
  },
  statusTextPending: {
    color: colors.warning,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.xl,
  },
});

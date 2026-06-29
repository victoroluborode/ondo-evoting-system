import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import { colors, spacing, radius, typography } from "../theme";

export default function SelectField({
  label,
  placeholder,
  value,
  options,
  onSelect,
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={typography.label}>{label}</Text> : null}

      <TouchableOpacity
        style={styles.trigger}
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{label || "Select an option"}</Text>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              style={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    item === value && styles.optionRowSelected,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      item === value && styles.optionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {item === value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.ml,
  },
  trigger: {
    height: 52,
    marginTop: spacing.xxs + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  triggerText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
  },
  placeholderText: {
    color: colors.textMuted,
    fontWeight: "400",
  },
  chevron: {
    fontSize: 14,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(13, 26, 18, 0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: "70%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  list: {
    marginTop: spacing.xs,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionRowSelected: {
    backgroundColor: colors.primaryDim,
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "800",
  },
  checkmark: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.primary,
  },
});

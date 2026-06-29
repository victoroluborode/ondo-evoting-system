import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, radius, shadows, spacing, typography } from '../theme';

export function ScreenHeader({ eyebrow, title, subtitle, chip }) {
  return (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={typography.h1}>{title}</Text>
        </View>
        {chip ? <StatusChip label={chip} dark /> : null}
      </View>
      {subtitle ? <Text style={[typography.subtitle, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

export function StatusChip({ label, tone = 'green', dark = false }) {
  const toneStyle = dark ? styles.chipDark : styles[`chip_${tone}`] || styles.chip_green;
  return (
    <View style={[styles.chip, toneStyle]}>
      <Text style={[styles.chipText, dark && styles.chipTextDark]}>{label}</Text>
    </View>
  );
}

export function ActionCard({ icon, title, subtitle, onPress, right, selected }) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.actionCard, selected && styles.actionCardSelected]}
    >
      <View style={styles.leftRail} />
      {icon ? <View style={styles.iconBox}><Text style={styles.iconText}>{icon}</Text></View> : null}
      <View style={styles.actionText}>
        <Text style={styles.actionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.actionSub}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.rightSlot}>{right}</View> : <Text style={styles.chevron}>›</Text>}
    </Wrapper>
  );
}

export function NoticeBox({ title, children, tone = 'neutral' }) {
  return (
    <View style={[styles.notice, styles[`notice_${tone}`] || styles.notice_neutral]}>
      {title ? <Text style={[styles.noticeTitle, styles[`noticeTitle_${tone}`]]}>{title}</Text> : null}
      <Text style={[styles.noticeText, styles[`noticeText_${tone}`]]}>{children}</Text>
    </View>
  );
}

export function ProgressTabs({ active = 0, items = [] }) {
  return (
    <View style={styles.tabs}>
      {items.map((item, index) => (
        <View
          key={item}
          style={[
            styles.tab,
            index === active && styles.tabActive,
            index < active && styles.tabDone,
          ]}
        >
          <Text style={[
            styles.tabText,
            index === active && styles.tabTextActive,
            index < active && styles.tabTextDone,
          ]}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function StatPanel({ label, value, footnote }) {
  return (
    <View style={styles.statPanel}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {footnote ? <Text style={styles.statFootnote}>{footnote}</Text> : null}
    </View>
  );
}

export const sharedStyles = {
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  centeredContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    // removed justifyContent — content now flows top-down naturally
  },
  middleContent: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.md,
  },
  formContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    // removed justifyContent: 'space-between' — this was the bug.
    // Content should flow naturally; we push the footer area down
    // with a spacer view instead (see screens below).
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
  },
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  chip: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderWidth: 1,
  },
  chip_green: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  chip_red: {
    backgroundColor: colors.errorTint,
    borderColor: '#E8C0BC',
  },
  chip_amber: {
    backgroundColor: colors.warningTint,
    borderColor: '#F0DDA0',
  },
  chipDark: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  chipText: {
    ...typography.label,
    color: colors.primary,
    fontSize: 14,
  },
  chipTextDark: {
    color: colors.white,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    minHeight: 84,
    padding: spacing.md,
    paddingLeft: spacing.ml,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  actionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDim,
  },
  leftRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryDim,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    color: colors.primary,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  actionSub: {
    fontSize: 15,
    lineHeight: 20,
    color: colors.textMuted,
    marginTop: 5,
  },
  rightSlot: {
    marginLeft: spacing.xs,
  },
  chevron: {
    color: colors.border,
    fontSize: 24,
    fontWeight: '800',
  },
  notice: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  notice_neutral: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  notice_success: {
    backgroundColor: colors.primaryDim,
    borderColor: colors.primaryBorder,
  },
  notice_warning: {
    backgroundColor: colors.warningTint,
    borderColor: '#F0DDA0',
  },
  notice_error: {
    backgroundColor: colors.errorTint,
    borderColor: '#E8C0BC',
  },
  noticeTitle: {
    ...typography.label,
    marginBottom: 3,
  },
  noticeTitle_success: {
    color: colors.primary,
  },
  noticeTitle_warning: {
    color: colors.warning,
  },
  noticeTitle_error: {
    color: colors.error,
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMid,
  },
  noticeText_success: {
    color: colors.primaryMid,
  },
  noticeText_warning: {
    color: '#7A5A10',
  },
  noticeText_error: {
    color: colors.error,
  },
  tabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    minHeight: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabDone: {
    backgroundColor: colors.primaryDim,
  },
  tabText: {
    ...typography.label,
    fontSize: 12,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.white,
  },
  tabTextDone: {
    color: colors.primary,
  },
  statPanel: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statLabel: {
    ...typography.label,
    color: colors.primaryBorder,
  },
  statValue: {
    fontSize: 64,
    lineHeight: 72,
    fontWeight: '900',
    color: colors.white,
    marginVertical: spacing.xs,
  },
  statFootnote: {
    fontSize: 14,
    color: colors.primaryBorder,
    textAlign: 'center',
  },
});

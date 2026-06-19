import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { COLORS, RADIUS, FONT } from "../constants";

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, accent }) => (
  <View style={[styles.statCard, accent && { borderColor: accent + "40" }]}>
    <Text style={[styles.statValue, accent && { color: accent }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
  </View>
);

// ── XPBar ─────────────────────────────────────────────────────────────────────
export const XPBar = ({ progress, level, totalXP }) => (
  <View style={styles.xpBarContainer}>
    <View style={styles.xpBarMeta}>
      <Text style={styles.xpLevel}>LVL {level}</Text>
      <Text style={styles.xpTotal}>{totalXP.toLocaleString()} XP</Text>
    </View>
    <View style={styles.xpTrack}>
      <View style={[styles.xpFill, { width: `${Math.min(100, progress)}%` }]} />
    </View>
  </View>
);

// ── ProgressRing (simple bar version) ────────────────────────────────────────
export const ProgressBar = ({ progress, color = COLORS.primary, height = 6 }) => (
  <View style={[styles.progressTrack, { height }]}>
    <View
      style={[
        styles.progressFill,
        { width: `${Math.min(100, progress)}%`, backgroundColor: color, height },
      ]}
    />
  </View>
);

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({
  onPress,
  label,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}) => {
  const bg =
    variant === "primary"
      ? COLORS.primary
      : variant === "danger"
      ? COLORS.accent
      : variant === "ghost"
      ? "transparent"
      : COLORS.bgElevated;

  const borderStyle =
    variant === "ghost" ? { borderWidth: 1, borderColor: COLORS.border } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[styles.btn, { backgroundColor: bg }, borderStyle, style, (disabled || loading) && { opacity: 0.5 }]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text style={[styles.btnText, variant === "ghost" && { color: COLORS.textSecondary }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, style, ...props }) => (
  <View style={[styles.inputWrapper, style]}>
    {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
    <View style={[styles.inputBox, error && { borderColor: COLORS.accent }]}>
      <Text
        style={styles.inputInner}
        // This is a wrapper; actual TextInput must be passed as children or use RN TextInput directly
      />
    </View>
    {error ? <Text style={styles.inputError}>{error}</Text> : null}
  </View>
);

// ── Badge chip ────────────────────────────────────────────────────────────────
export const BadgeChip = ({ icon, name }) => (
  <View style={styles.badgeChip}>
    <Text style={styles.badgeIcon}>{icon}</Text>
    <Text style={styles.badgeName}>{name}</Text>
  </View>
);

// ── Section header ────────────────────────────────────────────────────────────
export const SectionHeader = ({ title, action, onAction }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {action ? (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  // StatCard
  statCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  statValue: {
    color: COLORS.textPrimary,
    fontSize: FONT["2xl"],
    fontWeight: "700",
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT.xs,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  statSub: {
    color: COLORS.textMuted,
    fontSize: FONT.xs,
    marginTop: 2,
  },

  // XPBar
  xpBarContainer: { gap: 6 },
  xpBarMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  xpLevel: {
    color: COLORS.primary,
    fontSize: FONT.sm,
    fontWeight: "700",
    letterSpacing: 1,
  },
  xpTotal: {
    color: COLORS.textSecondary,
    fontSize: FONT.sm,
  },
  xpTrack: {
    height: 6,
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.full,
    overflow: "hidden",
  },
  xpFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },

  // ProgressBar
  progressTrack: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.full,
    overflow: "hidden",
    width: "100%",
  },
  progressFill: {
    borderRadius: RADIUS.full,
  },

  // Button
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: FONT.md,
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  // Input
  inputWrapper: { gap: 6 },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: FONT.sm,
    letterSpacing: 0.5,
  },
  inputBox: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputInner: { color: COLORS.textPrimary, fontSize: FONT.md },
  inputError: { color: COLORS.accent, fontSize: FONT.xs },

  // BadgeChip
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  badgeIcon: { fontSize: 16 },
  badgeName: { color: COLORS.textSecondary, fontSize: FONT.sm },

  // SectionHeader
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT.lg,
    fontWeight: "700",
  },
  sectionAction: {
    color: COLORS.primary,
    fontSize: FONT.sm,
  },
});

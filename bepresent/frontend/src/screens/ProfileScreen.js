import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getOverview, updateProfile } from "../api";
import { COLORS, RADIUS, FONT, getLevelName } from "../constants";
import { BADGE_MAP } from "../constants/badges";
import { xpProgress } from "../utils/formatters";
import { XPBar, SectionHeader } from "../components";

const BLOCKED_APP_OPTIONS = [
  "Instagram", "TikTok", "YouTube", "Twitter/X",
  "Snapchat", "Reddit", "Facebook", "WhatsApp",
];

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(String(user?.dailyGoalMinutes || 120));
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const ov = await getOverview();
      setOverview(ov);
    } catch {}
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSaveGoal = async () => {
    const val = parseInt(goalInput);
    if (isNaN(val) || val < 10 || val > 720) {
      Alert.alert("Invalid", "Goal must be between 10 and 720 minutes.");
      return;
    }
    try {
      const updated = await updateProfile({ dailyGoalMinutes: val });
      updateUser({ dailyGoalMinutes: updated.dailyGoalMinutes });
      setEditingGoal(false);
    } catch {
      Alert.alert("Error", "Couldn't update goal.");
    }
  };

  const toggleBlockedApp = async (app) => {
    const current = user?.blockedApps || [];
    const updated = current.includes(app)
      ? current.filter((a) => a !== app)
      : [...current, app];
    try {
      const res = await updateProfile({ blockedApps: updated });
      updateUser({ blockedApps: res.blockedApps });
    } catch {}
  };

  const handleLogout = () => {
    Alert.alert("Log out?", "You'll need to log back in.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  };

  const progress = xpProgress(overview?.totalXP || 0, overview?.level || 1);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Avatar / name */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitial}>
            {user?.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.levelName}>{getLevelName(overview?.level || 1)}</Text>
      </View>

      {/* XP bar */}
      <View style={styles.card}>
        <XPBar
          progress={progress}
          level={overview?.level || 1}
          totalXP={overview?.totalXP || 0}
        />
      </View>

      {/* Daily goal */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardTitle}>Daily Goal</Text>
          <TouchableOpacity onPress={() => setEditingGoal((p) => !p)}>
            <Text style={styles.editBtn}>{editingGoal ? "Cancel" : "Edit"}</Text>
          </TouchableOpacity>
        </View>
        {editingGoal ? (
          <View style={styles.goalEdit}>
            <TextInput
              style={styles.goalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
              placeholder="minutes"
              placeholderTextColor={COLORS.textMuted}
            />
            <Text style={styles.goalUnit}>minutes / day</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveGoal}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.goalValue}>
            {user?.dailyGoalMinutes || 120} minutes per day
          </Text>
        )}
      </View>

      {/* Blocked apps */}
      <SectionHeader title="Blocked Apps" />
      <View style={styles.appsGrid}>
        {BLOCKED_APP_OPTIONS.map((app) => {
          const active = (user?.blockedApps || []).includes(app);
          return (
            <TouchableOpacity
              key={app}
              style={[styles.appChip, active && styles.appChipActive]}
              onPress={() => toggleBlockedApp(app)}
            >
              <Text style={[styles.appChipText, active && styles.appChipTextActive]}>
                {app}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Badges */}
      {overview?.badges?.length > 0 && (
        <>
          <SectionHeader title="Badges" />
          <View style={styles.badgesGrid}>
            {overview.badges.map((b) => {
              const info = BADGE_MAP[b];
              if (!info) return null;
              return (
                <View key={b} style={styles.badgeCard}>
                  <Text style={styles.badgeIcon}>{info.icon}</Text>
                  <Text style={styles.badgeName}>{info.name}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 16, paddingBottom: 60 },
  avatarSection: { alignItems: "center", gap: 6, paddingVertical: 8 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: { color: "#fff", fontSize: 36, fontWeight: "800" },
  userName: { color: COLORS.textPrimary, fontSize: FONT.xl, fontWeight: "700" },
  userEmail: { color: COLORS.textSecondary, fontSize: FONT.sm },
  levelName: {
    color: COLORS.primary,
    fontSize: FONT.sm,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { color: COLORS.textPrimary, fontSize: FONT.md, fontWeight: "600" },
  editBtn: { color: COLORS.primary, fontSize: FONT.sm },
  goalEdit: { flexDirection: "row", alignItems: "center", gap: 10 },
  goalInput: {
    flex: 1,
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: FONT.md,
    padding: 10,
    textAlign: "center",
  },
  goalUnit: { color: COLORS.textSecondary, fontSize: FONT.sm },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: FONT.sm },
  goalValue: { color: COLORS.textPrimary, fontSize: FONT.md },
  appsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  appChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  appChipActive: {
    backgroundColor: COLORS.accent + "20",
    borderColor: COLORS.accent + "80",
  },
  appChipText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  appChipTextActive: { color: COLORS.accent, fontWeight: "600" },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badgeCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 80,
    gap: 6,
  },
  badgeIcon: { fontSize: 28 },
  badgeName: { color: COLORS.textSecondary, fontSize: FONT.xs, textAlign: "center" },
  logoutBtn: {
    borderWidth: 1,
    borderColor: COLORS.accent + "50",
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  logoutText: { color: COLORS.accent, fontSize: FONT.md, fontWeight: "600" },
});

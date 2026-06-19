import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { getOverview, getTodayStats } from "../api";
import { StatCard, XPBar, ProgressBar, SectionHeader, BadgeChip } from "../components";
import { COLORS, RADIUS, FONT, getLevelName } from "../constants";
import { getGreeting, formatMinutes, xpProgress } from "../utils/formatters";
import { BADGE_MAP } from "../constants/badges";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [today, setToday] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [ov, td] = await Promise.all([getOverview(), getTodayStats()]);
      setOverview(ov);
      setToday(td);
    } catch {}
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const progress = xpProgress(overview?.totalXP || 0, overview?.level || 1);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{user?.name?.split(" ")[0]} 👋</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={styles.streakCount}>{overview?.streak || 0}</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.card}>
        <View style={styles.levelRow}>
          <Text style={styles.levelName}>{getLevelName(overview?.level || 1)}</Text>
          <Text style={styles.levelNum}>Level {overview?.level || 1}</Text>
        </View>
        <XPBar
          progress={progress}
          level={overview?.level || 1}
          totalXP={overview?.totalXP || 0}
        />
      </View>

      {/* Today goal */}
      {today && (
        <View style={styles.card}>
          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Today's Goal</Text>
            <Text style={styles.goalPct}>{today.progress}%</Text>
          </View>
          <ProgressBar
            progress={today.progress}
            color={today.progress >= 100 ? COLORS.success : COLORS.primary}
            height={8}
          />
          <Text style={styles.goalSub}>
            {formatMinutes(today.minutesToday)} / {formatMinutes(today.dailyGoalMinutes)} ·{" "}
            {today.sessionsToday} session{today.sessionsToday !== 1 ? "s" : ""} today
          </Text>
        </View>
      )}

      {/* Start session CTA */}
      <TouchableOpacity
        style={styles.focusCTA}
        onPress={() => navigation.navigate("Focus")}
        activeOpacity={0.85}
      >
        <Text style={styles.focusCTAEmoji}>⚡</Text>
        <View>
          <Text style={styles.focusCTATitle}>Start Focus Session</Text>
          <Text style={styles.focusCTASub}>Put the phone down (except this app)</Text>
        </View>
        <Text style={styles.focusCTAArrow}>→</Text>
      </TouchableOpacity>

      {/* Stats grid */}
      <SectionHeader title="Your Stats" />
      <View style={styles.statsGrid}>
        <StatCard
          label="Total XP"
          value={(overview?.totalXP || 0).toLocaleString()}
          accent={COLORS.primary}
        />
        <StatCard
          label="Focus Hours"
          value={overview?.totalHours || 0}
          sub="all time"
          accent={COLORS.success}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Best Streak"
          value={`${overview?.longestStreak || 0}d`}
          accent={COLORS.warning}
        />
        <StatCard
          label="Sessions"
          value={overview?.totalSessions || 0}
          accent={COLORS.primaryLight}
        />
      </View>

      {/* Badges */}
      {overview?.badges?.length > 0 && (
        <>
          <SectionHeader title="Badges Earned" action="See all" onAction={() => navigation.navigate("Profile")} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesRow}>
            {overview.badges.map((b) => {
              const info = BADGE_MAP[b];
              if (!info) return null;
              return <BadgeChip key={b} icon={info.icon} name={info.name} />;
            })}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  greeting: { color: COLORS.textSecondary, fontSize: FONT.md },
  name: { color: COLORS.textPrimary, fontSize: FONT["2xl"], fontWeight: "800" },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  streakFire: { fontSize: 18 },
  streakCount: { color: COLORS.warning, fontSize: FONT.lg, fontWeight: "700" },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelName: { color: COLORS.textPrimary, fontSize: FONT.md, fontWeight: "600" },
  levelNum: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: "700" },
  goalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  goalLabel: { color: COLORS.textSecondary, fontSize: FONT.sm, letterSpacing: 0.5 },
  goalPct: { color: COLORS.textPrimary, fontSize: FONT.sm, fontWeight: "700" },
  goalSub: { color: COLORS.textMuted, fontSize: FONT.xs },
  focusCTA: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  focusCTAEmoji: { fontSize: 28 },
  focusCTATitle: { color: "#fff", fontSize: FONT.lg, fontWeight: "700" },
  focusCTASub: { color: "rgba(255,255,255,0.7)", fontSize: FONT.sm, marginTop: 2 },
  focusCTAArrow: { color: "#fff", fontSize: FONT.xl, marginLeft: "auto" },
  statsGrid: { flexDirection: "row", gap: 12 },
  badgesRow: { marginBottom: 4 },
});

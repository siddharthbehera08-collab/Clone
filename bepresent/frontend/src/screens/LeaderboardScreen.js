import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getGlobalLeaderboard, getWeeklyLeaderboard } from "../api";
import { useAuth } from "../context/AuthContext";
import { COLORS, RADIUS, FONT } from "../constants";

const RANK_COLORS = [COLORS.warning, "#C0C0C0", "#CD7F32"];
const RANK_EMOJIS = ["🥇", "🥈", "🥉"];

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState("global"); // global | weekly
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const fn = tab === "global" ? getGlobalLeaderboard : getWeeklyLeaderboard;
      const res = await fn();
      setData(res);
    } catch {}
  };

  useFocusEffect(useCallback(() => { load(); }, [tab]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const entries = data?.leaderboard || [];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <Text style={styles.pageTitle}>Leaderboard 🏆</Text>

      {/* My rank card */}
      {tab === "global" && data?.myRank && (
        <View style={styles.myRankCard}>
          <Text style={styles.myRankLabel}>Your Global Rank</Text>
          <Text style={styles.myRankValue}>#{data.myRank}</Text>
          <Text style={styles.myRankXP}>{(data.myXP || 0).toLocaleString()} XP</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {["global", "weekly"].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "global" ? "All Time" : "This Week"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Entries */}
      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No data yet. Be the first to grind.</Text>
        </View>
      ) : (
        entries.map((entry) => {
          const isMe = entry.name === user?.name;
          return (
            <View
              key={entry.rank}
              style={[
                styles.row,
                isMe && styles.rowMe,
                entry.rank <= 3 && { borderColor: RANK_COLORS[entry.rank - 1] + "50" },
              ]}
            >
              {/* Rank */}
              <View style={styles.rankBox}>
                {entry.rank <= 3 ? (
                  <Text style={styles.rankEmoji}>{RANK_EMOJIS[entry.rank - 1]}</Text>
                ) : (
                  <Text style={styles.rankNum}>{entry.rank}</Text>
                )}
              </View>

              {/* Info */}
              <View style={styles.rowInfo}>
                <Text style={[styles.rowName, isMe && { color: COLORS.primary }]}>
                  {entry.name} {isMe ? "(you)" : ""}
                </Text>
                <Text style={styles.rowSub}>
                  Lv.{entry.level}
                  {tab === "global"
                    ? ` · ${entry.streak}🔥`
                    : ` · ${entry.sessions} sessions`}
                </Text>
              </View>

              {/* XP */}
              <Text style={styles.rowXP}>
                {tab === "global"
                  ? `${(entry.totalXP || 0).toLocaleString()} XP`
                  : `+${(entry.weeklyXP || 0).toLocaleString()} XP`}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 14, paddingBottom: 40 },
  pageTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT["2xl"],
    fontWeight: "800",
    marginBottom: 4,
  },
  myRankCard: {
    backgroundColor: COLORS.primary + "20",
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.primary + "50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  myRankLabel: { color: COLORS.textSecondary, fontSize: FONT.sm },
  myRankValue: { color: COLORS.primary, fontSize: FONT["2xl"], fontWeight: "800" },
  myRankXP: { color: COLORS.textMuted, fontSize: FONT.sm },
  tabs: {
    flexDirection: "row",
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    alignItems: "center",
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textSecondary, fontSize: FONT.sm, fontWeight: "600" },
  tabTextActive: { color: "#fff" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  rowMe: {
    borderColor: COLORS.primary + "60",
    backgroundColor: COLORS.primary + "10",
  },
  rankBox: { width: 36, alignItems: "center" },
  rankEmoji: { fontSize: 22 },
  rankNum: { color: COLORS.textMuted, fontSize: FONT.md, fontWeight: "700" },
  rowInfo: { flex: 1 },
  rowName: { color: COLORS.textPrimary, fontSize: FONT.md, fontWeight: "600" },
  rowSub: { color: COLORS.textMuted, fontSize: FONT.xs, marginTop: 2 },
  rowXP: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: "700" },
  empty: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.textMuted, fontSize: FONT.md },
});

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import { getWeeklyStats, getSessionHistory } from "../api";
import { COLORS, RADIUS, FONT } from "../constants";
import { formatMinutes, formatDate, formatDayLabel } from "../utils/formatters";
import { SectionHeader } from "../components";

const { width } = Dimensions.get("window");

const chartConfig = {
  backgroundGradientFrom: COLORS.bgCard,
  backgroundGradientTo: COLORS.bgCard,
  backgroundGradientFromOpacity: 1,
  backgroundGradientToOpacity: 1,
  color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
  labelColor: () => COLORS.textSecondary,
  barPercentage: 0.55,
  decimalPlaces: 0,
  propsForBackgroundLines: { stroke: COLORS.border },
};

const STATUS_COLOR = {
  completed: COLORS.success,
  failed: COLORS.accent,
  active: COLORS.warning,
};

const STATUS_LABEL = {
  completed: "✅ Completed",
  failed: "❌ Failed",
  active: "⏳ Active",
};

export default function StatsScreen() {
  const [weekly, setWeekly] = useState(null);
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [w, h] = await Promise.all([getWeeklyStats(), getSessionHistory(1)]);
      setWeekly(w);
      setHistory(h.sessions || []);
    } catch {}
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const chartData = weekly
    ? {
        labels: weekly.days.map((d) => formatDayLabel(d.date)),
        datasets: [{ data: weekly.days.map((d) => Math.round(d.minutes / 60 * 10) / 10 || 0) }],
      }
    : null;

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <Text style={styles.pageTitle}>Analytics</Text>

      {/* Weekly summary */}
      {weekly && (
        <View style={styles.card}>
          <View style={styles.weekRow}>
            <View>
              <Text style={styles.metricValue}>{formatMinutes(weekly.totalMinutes)}</Text>
              <Text style={styles.metricLabel}>This week</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.metricValue}>{formatMinutes(weekly.avgMinutes)}</Text>
              <Text style={styles.metricLabel}>Daily avg</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bar chart */}
      {chartData && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Focus Hours · Last 7 Days</Text>
          <BarChart
            data={chartData}
            width={width - 56}
            height={180}
            chartConfig={chartConfig}
            fromZero
            showValuesOnTopOfBars
            withInnerLines
            style={{ marginLeft: -12 }}
          />
        </View>
      )}

      {/* Session history */}
      <SectionHeader title="Session History" />
      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No sessions yet. Go lock in.</Text>
        </View>
      ) : (
        history.map((s) => (
          <View key={s._id} style={styles.sessionRow}>
            <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[s.status] }]} />
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionNote}>
                {s.note || "Focus session"}
              </Text>
              <Text style={styles.sessionMeta}>
                {formatDate(s.startTime)} · {formatMinutes(s.durationMinutes)}
              </Text>
            </View>
            <View style={styles.sessionRight}>
              <Text style={styles.sessionXP}>+{s.xpEarned} XP</Text>
              <Text style={[styles.sessionStatus, { color: STATUS_COLOR[s.status] }]}>
                {STATUS_LABEL[s.status]}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 20, gap: 16, paddingBottom: 40 },
  pageTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT["2xl"],
    fontWeight: "800",
    marginBottom: 4,
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  metricValue: { color: COLORS.textPrimary, fontSize: FONT["2xl"], fontWeight: "700" },
  metricLabel: { color: COLORS.textSecondary, fontSize: FONT.xs, marginTop: 2 },
  chartCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
    overflow: "hidden",
  },
  chartTitle: { color: COLORS.textSecondary, fontSize: FONT.sm, letterSpacing: 0.5 },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  sessionInfo: { flex: 1, gap: 3 },
  sessionNote: { color: COLORS.textPrimary, fontSize: FONT.sm, fontWeight: "600" },
  sessionMeta: { color: COLORS.textMuted, fontSize: FONT.xs },
  sessionRight: { alignItems: "flex-end", gap: 3 },
  sessionXP: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: "700" },
  sessionStatus: { fontSize: FONT.xs },
  empty: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.textMuted, fontSize: FONT.md },
});

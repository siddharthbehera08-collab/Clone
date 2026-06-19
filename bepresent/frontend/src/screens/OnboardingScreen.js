import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api";
import { COLORS, RADIUS, FONT } from "../constants";

const APP_OPTIONS = [
  "Instagram", "TikTok", "YouTube", "Twitter/X",
  "Snapchat", "Reddit", "Facebook", "WhatsApp",
];

const GOAL_OPTIONS = [
  { label: "Light", sub: "1 hour/day", value: 60 },
  { label: "Moderate", sub: "2 hours/day", value: 120 },
  { label: "Serious", sub: "3 hours/day", value: 180 },
  { label: "Beast mode", sub: "4+ hours/day", value: 240 },
];

export default function OnboardingScreen() {
  const { updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedApps, setSelectedApps] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(120);
  const [loading, setLoading] = useState(false);

  const toggleApp = (app) =>
    setSelectedApps((p) =>
      p.includes(app) ? p.filter((a) => a !== app) : [...p, app]
    );

  const handleFinish = async () => {
    setLoading(true);
    try {
      const updated = await updateProfile({
        blockedApps: selectedApps,
        dailyGoalMinutes: selectedGoal,
        onboardingComplete: true,
      });
      updateUser({
        blockedApps: updated.blockedApps,
        dailyGoalMinutes: updated.dailyGoalMinutes,
        onboardingComplete: true,
      });
    } catch {
      Alert.alert("Error", "Setup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1].map((i) => (
          <View key={i} style={[styles.dot, step >= i && styles.dotActive]} />
        ))}
      </View>

      {step === 0 && (
        <ScrollView contentContainerStyle={styles.stepContainer}>
          <Text style={styles.stepEmoji}>📵</Text>
          <Text style={styles.stepTitle}>Which apps distract you?</Text>
          <Text style={styles.stepSub}>
            We'll help you stay off them. Be honest with yourself.
          </Text>
          <View style={styles.appsGrid}>
            {APP_OPTIONS.map((app) => {
              const active = selectedApps.includes(app);
              return (
                <TouchableOpacity
                  key={app}
                  style={[styles.appChip, active && styles.appChipActive]}
                  onPress={() => toggleApp(app)}
                >
                  <Text style={[styles.appChipText, active && styles.appChipTextActive]}>
                    {app}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(1)}>
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {step === 1 && (
        <ScrollView contentContainerStyle={styles.stepContainer}>
          <Text style={styles.stepEmoji}>🎯</Text>
          <Text style={styles.stepTitle}>Set your daily goal</Text>
          <Text style={styles.stepSub}>
            How much focus time do you want to log per day?
          </Text>
          <View style={styles.goalsGrid}>
            {GOAL_OPTIONS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[styles.goalCard, selectedGoal === g.value && styles.goalCardActive]}
                onPress={() => setSelectedGoal(g.value)}
              >
                <Text style={[styles.goalLabel, selectedGoal === g.value && { color: "#fff" }]}>
                  {g.label}
                </Text>
                <Text style={[styles.goalSub, selectedGoal === g.value && { color: "rgba(255,255,255,0.75)" }]}>
                  {g.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, loading && { opacity: 0.6 }]}
            onPress={handleFinish}
            disabled={loading}
          >
            <Text style={styles.nextBtnText}>
              {loading ? "Setting up..." : "Let's Go ⚡"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 60 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.bgElevated,
  },
  dotActive: { backgroundColor: COLORS.primary, width: 24 },
  stepContainer: { padding: 24, gap: 20, alignItems: "center" },
  stepEmoji: { fontSize: 56 },
  stepTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT["2xl"],
    fontWeight: "800",
    textAlign: "center",
  },
  stepSub: {
    color: COLORS.textSecondary,
    fontSize: FONT.md,
    textAlign: "center",
    lineHeight: 22,
  },
  appsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    width: "100%",
  },
  appChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  appChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  appChipText: { color: COLORS.textSecondary, fontSize: FONT.sm, fontWeight: "600" },
  appChipTextActive: { color: "#fff" },
  goalsGrid: { width: "100%", gap: 10 },
  goalCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  goalCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  goalLabel: { color: COLORS.textPrimary, fontSize: FONT.md, fontWeight: "700" },
  goalSub: { color: COLORS.textSecondary, fontSize: FONT.sm },
  nextBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 48,
    width: "100%",
    alignItems: "center",
    marginTop: 8,
  },
  nextBtnText: { color: "#fff", fontSize: FONT.lg, fontWeight: "700" },
});

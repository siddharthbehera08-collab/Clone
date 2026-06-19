import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Vibration,
} from "react-native";
import { startSession, endSession, getActiveSession } from "../api";
import { COLORS, RADIUS, FONT } from "../constants";
import { formatTime } from "../utils/formatters";

const DURATIONS = [
  { label: "25 min", value: 25 },
  { label: "45 min", value: 45 },
  { label: "60 min", value: 60 },
  { label: "90 min", value: 90 },
];

const QUOTES = [
  "Stay off the reels, bro.",
  "Your future self is watching.",
  "This is your villain origin story. Make it count.",
  "Every minute here is a minute NOT on Instagram.",
  "You're built different. Act like it.",
  "No notifications. No excuses.",
  "Eyes on the prize. The reels can wait.",
];

export default function FocusScreen() {
  const [phase, setPhase] = useState("idle"); // idle | active | done
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [sessionId, setSessionId] = useState(null);
  const [interruptions, setInterruptions] = useState(0);
  const [note, setNote] = useState("");
  const [result, setResult] = useState(null);
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const intervalRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const interruptRef = useRef(0);

  // Restore active session on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getActiveSession();
        if (data.active && data.session) {
          const elapsed = Math.floor(
            (Date.now() - new Date(data.session.startTime)) / 1000
          );
          const planned = data.session.plannedDurationMinutes * 60;
          const remaining = Math.max(0, planned - elapsed);
          setSessionId(data.session._id);
          setTotalSeconds(planned);
          setTimeLeft(remaining);
          setPhase("active");
        }
      } catch {}
    })();
  }, []);

  // AppState: detect backgrounding during active session
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      if (
        appStateRef.current === "active" &&
        next.match(/inactive|background/) &&
        phase === "active"
      ) {
        interruptRef.current += 1;
        setInterruptions((p) => p + 1);
        // Don't auto-fail — just count interruptions
        Vibration.vibrate(200);
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [phase]);

  // Countdown
  useEffect(() => {
    if (phase === "active" && timeLeft > 0) {
      intervalRef.current = setInterval(
        () => setTimeLeft((p) => p - 1),
        1000
      );
    } else if (phase === "active" && timeLeft === 0) {
      handleEnd("completed");
    }
    return () => clearInterval(intervalRef.current);
  }, [phase, timeLeft]);

  const handleStart = async () => {
    try {
      const data = await startSession(selectedDuration, note);
      setSessionId(data.sessionId);
      setTotalSeconds(selectedDuration * 60);
      setTimeLeft(selectedDuration * 60);
      interruptRef.current = 0;
      setInterruptions(0);
      setPhase("active");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Couldn't start session.");
    }
  };

  const handleEnd = useCallback(
    async (status) => {
      clearInterval(intervalRef.current);
      setPhase("done");
      try {
        const data = await endSession(status, interruptRef.current);
        setResult({ ...data, status });
      } catch (err) {
        Alert.alert("Error", err?.response?.data?.message || "Couldn't end session.");
        setPhase("idle");
      }
    },
    []
  );

  const handleGiveUp = () => {
    Alert.alert(
      "Give up? Really?",
      "Your streak will reset. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes, give up", style: "destructive", onPress: () => handleEnd("failed") },
      ]
    );
  };

  const handleReset = () => {
    setPhase("idle");
    setResult(null);
    setTimeLeft(selectedDuration * 60);
    setInterruptions(0);
    interruptRef.current = 0;
    setNote("");
  };

  const progress = 1 - timeLeft / totalSeconds;

  // ── IDLE ─────────────────────────────────────────────────────────────────
  if (phase === "idle") {
    return (
      <View style={styles.root}>
        <Text style={styles.idleTitle}>Focus Session</Text>
        <Text style={styles.idleSub}>How long are you locking in for?</Text>

        <View style={styles.durationGrid}>
          {DURATIONS.map((d) => (
            <TouchableOpacity
              key={d.value}
              style={[
                styles.durationBtn,
                selectedDuration === d.value && styles.durationBtnActive,
              ]}
              onPress={() => {
                setSelectedDuration(d.value);
                setTimeLeft(d.value * 60);
              }}
            >
              <Text
                style={[
                  styles.durationBtnText,
                  selectedDuration === d.value && styles.durationBtnTextActive,
                ]}
              >
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.noteBtn}
          onPress={() => setShowNoteModal(true)}
        >
          <Text style={styles.noteBtnText}>
            {note ? `📝 ${note}` : "+ What are you working on?"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.startBtnText}>Lock In ⚡</Text>
        </TouchableOpacity>

        {/* Note modal */}
        <Modal visible={showNoteModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>What are you working on?</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="e.g. DSA practice, chapter 5..."
                placeholderTextColor={COLORS.textMuted}
                maxLength={80}
                autoFocus
              />
              <TouchableOpacity
                style={styles.modalDone}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ── ACTIVE ────────────────────────────────────────────────────────────────
  if (phase === "active") {
    return (
      <View style={styles.root}>
        <Text style={styles.quoteText}>{quote}</Text>

        {/* Timer ring (fake circle with text) */}
        <View style={styles.timerRingOuter}>
          <View
            style={[
              styles.timerRingInner,
              { borderColor: progress > 0.8 ? COLORS.success : COLORS.primary },
            ]}
          >
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.timerSub}>{note || "Focus mode"}</Text>
          </View>
        </View>

        {interruptions > 0 && (
          <View style={styles.interruptBadge}>
            <Text style={styles.interruptText}>
              ⚠️ {interruptions} interruption{interruptions !== 1 ? "s" : ""}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.giveUpBtn}
          onPress={handleGiveUp}
          activeOpacity={0.75}
        >
          <Text style={styles.giveUpText}>Give Up (Don't)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={styles.doneContainer}>
      {result?.status === "completed" ? (
        <>
          <Text style={styles.doneEmoji}>🎯</Text>
          <Text style={styles.doneTitle}>Session Complete</Text>
          <Text style={styles.doneSub}>You actually did it.</Text>
          <View style={styles.resultCards}>
            <View style={styles.resultCard}>
              <Text style={styles.resultValue}>+{result.xpEarned}</Text>
              <Text style={styles.resultLabel}>XP Earned</Text>
            </View>
            <View style={styles.resultCard}>
              <Text style={styles.resultValue}>{result.currentStreak}🔥</Text>
              <Text style={styles.resultLabel}>Streak</Text>
            </View>
            {result.multiplier > 1 && (
              <View style={styles.resultCard}>
                <Text style={[styles.resultValue, { color: COLORS.warning }]}>
                  {result.multiplier}x
                </Text>
                <Text style={styles.resultLabel}>Streak Bonus</Text>
              </View>
            )}
          </View>
          {result.newBadges?.length > 0 && (
            <View style={styles.newBadges}>
              <Text style={styles.newBadgesTitle}>🏅 Badge Unlocked!</Text>
              {result.newBadges.map((b) => (
                <Text key={b.badgeId} style={styles.newBadgeName}>
                  {b.icon} {b.name}
                </Text>
              ))}
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={styles.doneEmoji}>💀</Text>
          <Text style={styles.doneTitle}>Session Failed</Text>
          <Text style={styles.doneSub}>Touch grass, then try again.</Text>
        </>
      )}
      <TouchableOpacity style={styles.startBtn} onPress={handleReset}>
        <Text style={styles.startBtnText}>Start Another</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 28,
  },
  idleTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT["3xl"],
    fontWeight: "800",
  },
  idleSub: { color: COLORS.textSecondary, fontSize: FONT.md },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  durationBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  durationBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  durationBtnText: { color: COLORS.textSecondary, fontWeight: "600", fontSize: FONT.md },
  durationBtnTextActive: { color: "#fff" },
  noteBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
  },
  noteBtnText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 16,
    paddingHorizontal: 48,
    alignItems: "center",
    width: "100%",
  },
  startBtnText: { color: "#fff", fontSize: FONT.lg, fontWeight: "700" },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 24,
    gap: 16,
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: FONT.lg, fontWeight: "700" },
  noteInput: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: FONT.md,
    padding: 14,
  },
  modalDone: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalDoneText: { color: "#fff", fontWeight: "700", fontSize: FONT.md },
  // Active
  quoteText: {
    color: COLORS.textSecondary,
    fontSize: FONT.md,
    fontStyle: "italic",
    textAlign: "center",
  },
  timerRingOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  timerRingInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  timerText: {
    color: COLORS.textPrimary,
    fontSize: 56,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  timerSub: { color: COLORS.textSecondary, fontSize: FONT.sm },
  interruptBadge: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.warning + "60",
  },
  interruptText: { color: COLORS.warning, fontSize: FONT.sm },
  giveUpBtn: {
    borderWidth: 1,
    borderColor: COLORS.accent + "50",
    borderRadius: RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  giveUpText: { color: COLORS.accent, fontSize: FONT.md, fontWeight: "600" },
  // Done
  doneContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 20,
  },
  doneEmoji: { fontSize: 64 },
  doneTitle: { color: COLORS.textPrimary, fontSize: FONT["2xl"], fontWeight: "800" },
  doneSub: { color: COLORS.textSecondary, fontSize: FONT.md },
  resultCards: { flexDirection: "row", gap: 12 },
  resultCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 90,
  },
  resultValue: {
    color: COLORS.primary,
    fontSize: FONT["2xl"],
    fontWeight: "800",
  },
  resultLabel: { color: COLORS.textMuted, fontSize: FONT.xs, marginTop: 4 },
  newBadges: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.warning + "40",
    gap: 8,
  },
  newBadgesTitle: { color: COLORS.warning, fontSize: FONT.md, fontWeight: "700" },
  newBadgeName: { color: COLORS.textPrimary, fontSize: FONT.md },
});

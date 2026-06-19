import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { COLORS, RADIUS, FONT } from "../constants";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Email and password required.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert("Login failed", err?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.logo}>⏳</Text>
          <Text style={styles.appName}>BePresent</Text>
          <Text style={styles.tagline}>Stop scrolling. Start living.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Welcome back</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>{loading ? "Logging in..." : "Log In"}</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.footerLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 40,
  },
  hero: { alignItems: "center", gap: 8 },
  logo: { fontSize: 56 },
  appName: {
    color: COLORS.textPrimary,
    fontSize: FONT["4xl"],
    fontWeight: "800",
    letterSpacing: -1,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontSize: FONT.md,
  },
  form: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 20,
  },
  formTitle: {
    color: COLORS.textPrimary,
    fontSize: FONT.xl,
    fontWeight: "700",
  },
  inputGroup: { gap: 6 },
  label: {
    color: COLORS.textSecondary,
    fontSize: FONT.sm,
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    fontSize: FONT.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    color: "#fff",
    fontSize: FONT.md,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  footerLink: {
    color: COLORS.primary,
    fontSize: FONT.sm,
    fontWeight: "600",
  },
});

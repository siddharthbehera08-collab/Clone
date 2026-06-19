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

export default function SignupScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "All fields required.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
    } catch (err) {
      Alert.alert("Signup failed", err?.response?.data?.message || "Something went wrong.");
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
          <Text style={styles.tagline}>Your focus era starts now.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>Create account</Text>

          {[
            { label: "Name", value: name, setter: setName, placeholder: "Your name", opts: {} },
            { label: "Email", value: email, setter: setEmail, placeholder: "you@example.com", opts: { keyboardType: "email-address", autoCapitalize: "none" } },
            { label: "Password", value: password, setter: setPassword, placeholder: "Min 6 characters", opts: { secureTextEntry: true } },
          ].map(({ label, value, setter, placeholder, opts }) => (
            <View key={label} style={styles.inputGroup}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textMuted}
                {...opts}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.6 }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.btnText}>
              {loading ? "Creating account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.footerLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, justifyContent: "center", padding: 24, gap: 40 },
  hero: { alignItems: "center", gap: 8 },
  logo: { fontSize: 56 },
  appName: {
    color: COLORS.textPrimary,
    fontSize: FONT["4xl"],
    fontWeight: "800",
    letterSpacing: -1,
  },
  tagline: { color: COLORS.textSecondary, fontSize: FONT.md },
  form: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 18,
  },
  formTitle: { color: COLORS.textPrimary, fontSize: FONT.xl, fontWeight: "700" },
  inputGroup: { gap: 6 },
  label: { color: COLORS.textSecondary, fontSize: FONT.sm, letterSpacing: 0.4 },
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
  btnText: { color: "#fff", fontSize: FONT.md, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: COLORS.textSecondary, fontSize: FONT.sm },
  footerLink: { color: COLORS.primary, fontSize: FONT.sm, fontWeight: "600" },
});

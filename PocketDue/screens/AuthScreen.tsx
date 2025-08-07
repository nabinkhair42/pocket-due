import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { apiService } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";
import { Mail, Lock, User, ChevronLeft } from "lucide-react-native";
import { Button } from "../components/Button";
import { AppLogo } from "../components/Icons";
import { useToast } from "../contexts/ToastContext";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { showToast } = useToast();

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.register({
        email: email.trim(),
        password: password.trim(),
        name: name.trim(),
      });

      if (result.success) {
        showToast("Registration successful!", "success");
        onAuthSuccess();
      } else {
        showToast(result.error || "Registration failed", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Please fill in all fields", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.login({
        email: email.trim(),
        password: password.trim(),
      });

      if (result.success) {
        showToast("Login successful!", "success");
        onAuthSuccess();
      } else {
        showToast(result.error || "Login failed", "error");
      }
    } catch (error: any) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const renderWelcomeScreen = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <AppLogo size={80} style={styles.logo} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          PocketDue
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your payments with ease
        </Text>
      </View>

      <View style={styles.content}>
        <View>
          <TouchableOpacity
            onPress={() => setShowEmailForm(true)}
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          >
            <Mail size={20} color={colors.surface} />
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              Continue with Email
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmailForm = () => (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formHeader}>
        <TouchableOpacity
          onPress={() => setShowEmailForm(false)}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
          {showLoginForm ? "Welcome Back" : "Create Account"}
        </Text>
      </View>

      <View style={styles.formContainer}>
        {!showLoginForm && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Full Name
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface },
              ]}
            >
              <User size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textTertiary}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Email Address
          </Text>
          <View
            style={[styles.inputContainer, { backgroundColor: colors.surface }]}
          >
            <Mail size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.textPrimary }]}>
            Password
          </Text>
          <View
            style={[styles.inputContainer, { backgroundColor: colors.surface }]}
          >
            <Lock size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        <Button
          onPress={showLoginForm ? handleLogin : handleRegister}
          variant="primary"
          size="lg"
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              {showLoginForm ? "Sign In" : "Create Account"}
            </Text>
          )}
        </Button>

        <TouchableOpacity
          onPress={() => setShowLoginForm(!showLoginForm)}
          style={styles.switchButton}
        >
          <Text style={[styles.switchText, { color: colors.primary }]}>
            {showLoginForm
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return showEmailForm ? renderEmailForm() : renderWelcomeScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 60,
    paddingBottom: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 6,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  submitButton: {
    marginTop: 32,
  },
  switchButton: {
    alignItems: "center",
    marginTop: 24,
  },
  switchText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

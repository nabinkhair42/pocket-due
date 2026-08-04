import { ChevronLeft, ChevronRight, Lock, Mail, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  BackHandler,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/button";
import { AppLogo } from "../components/icons";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/toast-context";
import { useAuth } from "../hooks/use-auth";
import { getThemeColors, typography } from "../lib/theme";
import { LoginRequest, RegisterRequest } from "../types/api";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { showToast } = useToast();
  const { register, login, loading } = useAuth();

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!showEmailForm) return false;
      dismissForm();
      return true;
    });

    return () => subscription.remove();
  }, [showEmailForm]);

  // The form is a branch of a component that never unmounts, so credentials
  // would otherwise sit in state after the user backs out.
  const dismissForm = () => {
    setShowEmailForm(false);
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      showToast("Enter your name, email, and password to continue.", "error");
      return;
    }

    const data: RegisterRequest = {
      email: email.trim(),
      password: password.trim(),
      name: name.trim(),
    };

    const result = await register(data);

    if (result.success) {
      showToast("Account created", "success");
      onAuthSuccess();
    } else {
      showToast(result.error || "Unable to create your account. Try again.", "error");
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showToast("Enter your email and password to continue.", "error");
      return;
    }

    const data: LoginRequest = {
      email: email.trim(),
      password: password.trim(),
    };

    const result = await login(data);

    if (result.success) {
      showToast("Signed in", "success");
      onAuthSuccess();
    } else {
      showToast(result.error || "Unable to sign in. Check your details and try again.", "error");
    }
  };

  const renderWelcomeScreen = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <AppLogo size={80} style={styles.logo} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          PocketDue
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Keep track of what you owe and what others owe you.
        </Text>
      </View>

      <View style={styles.content}>
        <View>
          <Button
            icon={<ChevronRight size={20} color={colors.white} />}
            variant="primary"
            onPress={() => setShowEmailForm(true)}
            size="lg"
            fullWidth
          >
            Get started
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderEmailForm = () => (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.formHeader}>
        <TouchableOpacity
          onPress={dismissForm}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.formTitle, { color: colors.textPrimary }]}>
          {showLoginForm ? "Welcome back" : "Create account"}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {!showLoginForm && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Full name
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
              Email address
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
          fullWidth
          loading={loading}
          disabled={loading}
        >
          {showLoginForm ? "Sign in" : "Create account"}
        </Button>

        <TouchableOpacity
          onPress={() => setShowLoginForm(!showLoginForm)}
          style={styles.switchButton}
          accessibilityRole="button"
        >
          <Text style={[styles.switchText, { color: colors.primary }]}>
            {showLoginForm
              ? "New to PocketDue? Create an account"
              : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return showEmailForm ? renderEmailForm() : renderWelcomeScreen();
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
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
    ...typography.h1,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    textAlign: "center",
    maxWidth: 320,
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
    ...typography.button,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 6,
  },
  formTitle: {
    ...typography.h2,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  },
  input: {
    flex: 1,
    ...typography.body,
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

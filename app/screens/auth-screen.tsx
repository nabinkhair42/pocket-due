import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/toast-context";
import { useAuth } from "../hooks/use-auth";
import { AppLogo, GithubIcon, GoogleIcon } from "../icons";
import { getThemeColors, radius, shadows, spacing, typography } from "../lib/theme";

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

type SocialProvider = "google" | "github";

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { showToast } = useToast();
  const { signInWithProvider, loading } = useAuth();
  const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);

  const busy = loading || pendingProvider !== null;

  const handleSignIn = async (provider: SocialProvider) => {
    if (busy) return;
    setPendingProvider(provider);
    try {
      const result = await signInWithProvider(provider);
      if (result.success) {
        onAuthSuccess();
        return;
      }

      showToast(
        result.error || `Unable to sign in with ${provider === "google" ? "Google" : "GitHub"}. Try again.`,
        "error",
      );
    } finally {
      setPendingProvider(null);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.hero}>
        <View style={[styles.logoSurface, { backgroundColor: colors.surface }, shadows.md]}>
          <AppLogo size={72} style={styles.logo} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>PocketDue</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Keep track of what you owe and what others owe you.</Text>
      </View>

      <View style={styles.actions}>
        <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>Sign in to continue</Text>
        <Text style={[styles.actionHint, { color: colors.textSecondary }]}>Choose an account you already trust. No new password required.</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
          accessibilityState={{ disabled: busy, busy: pendingProvider === "google" }}
          disabled={busy}
          onPress={() => handleSignIn("google")}
          style={({ pressed }) => [
            styles.socialButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && !busy && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          <View style={styles.iconSlot}>
            {pendingProvider === "google" ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <GoogleIcon size={21} />
            )}
          </View>
          <Text style={[styles.socialButtonText, { color: colors.textPrimary }]}>Continue with Google</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue with GitHub"
          accessibilityState={{ disabled: busy, busy: pendingProvider === "github" }}
          disabled={busy}
          onPress={() => handleSignIn("github")}
          style={({ pressed }) => [
            styles.socialButton,
            { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary },
            pressed && !busy && styles.pressed,
            busy && styles.disabled,
          ]}
        >
          <View style={styles.iconSlot}>
            {pendingProvider === "github" ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <GithubIcon size={21} color={colors.background} />
            )}
          </View>
          <Text style={[styles.socialButtonText, { color: colors.background }]}>Continue with GitHub</Text>
        </Pressable>

        <Text style={[styles.privacyCopy, { color: colors.textTertiary }]}>By continuing, you agree to PocketDue’s terms and privacy policy.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl },
  hero: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: spacing.xxxl },
  logoSurface: { width: 104, height: 104, borderRadius: radius.xl, alignItems: "center", justifyContent: "center", marginBottom: spacing.xxl },
  logo: { alignSelf: "center" },
  title: { ...typography.h1, textAlign: "center", marginBottom: spacing.sm },
  subtitle: { ...typography.body, textAlign: "center", maxWidth: 330 },
  actions: { paddingBottom: spacing.xxxl, gap: spacing.md },
  actionTitle: { ...typography.h3, textAlign: "center" },
  actionHint: { ...typography.caption, textAlign: "center", marginBottom: spacing.sm, paddingHorizontal: spacing.lg },
  socialButton: { minHeight: 56, borderRadius: radius.lg, borderWidth: 1, paddingHorizontal: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.md },
  socialButtonText: { ...typography.button, textAlign: "center" },
  iconSlot: { width: 21, height: 21, alignItems: "center", justifyContent: "center" },
  pressed: { transform: [{ scale: 0.96 }] },
  disabled: { opacity: 0.55 },
  privacyCopy: { ...typography.small, textAlign: "center", marginTop: spacing.xs, paddingHorizontal: spacing.md },
});

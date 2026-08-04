import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, User, Mail, Save } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius, typography } from "../lib/theme";
import { useUser } from "../hooks/use-user";
import { Button } from "../components/button";

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onBack,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { loading, updateProfile, getCurrentUserData } = useUser();
  const [formData, setFormData] = useState(() => getCurrentUserData());
  const isDirty = useRef(false);

  useEffect(() => {
    if (isDirty.current) return;
    setFormData(getCurrentUserData());
  }, [getCurrentUserData]);

  const handleChange = (field: "name" | "email", value: string) => {
    isDirty.current = true;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const success = await updateProfile({
      name: formData.name,
      email: formData.email,
    });

    if (success) {
      isDirty.current = false;
      onBack();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {Platform.OS === "ios" && <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>}
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Edit Profile
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Personal Information
          </Text>
          <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>
            Update your display name. Your email is managed by your OAuth provider.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Full Name
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <User size={18} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textTertiary}
                value={formData.name}
                onChangeText={(text) => handleChange("name", text)}
                autoCapitalize="words"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Email Address
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Mail size={18} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                value={formData.email}
                editable={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={<Save size={18} color={colors.white} />}
          >
            Save Changes
          </Button>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.h2,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.captionMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    ...typography.caption,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodyMedium,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    ...typography.body,
    minHeight: 24,
  },
  actions: {
    marginTop: spacing.xxxl,
  },
});

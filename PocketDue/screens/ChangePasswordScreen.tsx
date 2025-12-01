import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Lock, Eye, EyeOff, Save } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius, typography } from "../lib/theme";
import { useUser } from "../hooks/useUser";
import { Button } from "../components/Button";

interface ChangePasswordScreenProps {
  onBack: () => void;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({
  onBack,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { loading, changePassword } = useUser();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = async () => {
    const success = await changePassword({
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword,
    });

    if (success) {
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      onBack();
    }
  };

  const renderPasswordField = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    onToggleVisibility: () => void
  ) => (
    <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Lock size={18} color={colors.textTertiary} />
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={onToggleVisibility}>
        {showPassword ? (
          <EyeOff size={18} color={colors.textTertiary} />
        ) : (
          <Eye size={18} color={colors.textTertiary} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Change Password
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Password Security
          </Text>
          <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>
            Update your password to keep your account secure
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Current Password
            </Text>
            {renderPasswordField(
              "Enter current password",
              formData.currentPassword,
              (text) => setFormData({ ...formData, currentPassword: text }),
              showCurrentPassword,
              () => setShowCurrentPassword(!showCurrentPassword)
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              New Password
            </Text>
            {renderPasswordField(
              "Enter new password",
              formData.newPassword,
              (text) => setFormData({ ...formData, newPassword: text }),
              showNewPassword,
              () => setShowNewPassword(!showNewPassword)
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              Confirm Password
            </Text>
            {renderPasswordField(
              "Confirm new password",
              formData.confirmPassword,
              (text) => setFormData({ ...formData, confirmPassword: text }),
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword)
            )}
          </View>
        </View>

        <View style={[styles.requirements, { backgroundColor: colors.surfaceSecondary }]}>
          <Text style={[styles.requirementsTitle, { color: colors.textPrimary }]}>
            Password Requirements
          </Text>
          <Text style={[styles.requirement, { color: colors.textSecondary }]}>
            • At least 6 characters long
          </Text>
          <Text style={[styles.requirement, { color: colors.textSecondary }]}>
            • Must be different from current password
          </Text>
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
            Change Password
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
  requirements: {
    padding: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.xxl,
  },
  requirementsTitle: {
    ...typography.bodyMedium,
    marginBottom: spacing.sm,
  },
  requirement: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  actions: {
    marginTop: spacing.xxl,
  },
});

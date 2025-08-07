import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { ChevronLeft, Lock, Eye, EyeOff, Save } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";
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
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    onToggleVisibility: () => void
  ) => (
    <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={onToggleVisibility} style={styles.eyeButton}>
        {showPassword ? (
          <EyeOff size={20} color={colors.textSecondary} />
        ) : (
          <Eye size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Change Password
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Password Security
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Update your password to keep your account secure
          </Text>
        </View>

        <View style={styles.form}>
          {renderPasswordField(
            <Lock size={20} color={colors.textSecondary} />,
            "Current Password",
            formData.currentPassword,
            (text) => setFormData({ ...formData, currentPassword: text }),
            showCurrentPassword,
            () => setShowCurrentPassword(!showCurrentPassword)
          )}

          {renderPasswordField(
            <Lock size={20} color={colors.textSecondary} />,
            "New Password",
            formData.newPassword,
            (text) => setFormData({ ...formData, newPassword: text }),
            showNewPassword,
            () => setShowNewPassword(!showNewPassword)
          )}

          {renderPasswordField(
            <Lock size={20} color={colors.textSecondary} />,
            "Confirm New Password",
            formData.confirmPassword,
            (text) => setFormData({ ...formData, confirmPassword: text }),
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword)
          )}
        </View>

        <View style={styles.requirements}>
          <Text
            style={[styles.requirementsTitle, { color: colors.textPrimary }]}
          >
            Password Requirements:
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
            style={styles.saveButton}
            disabled={loading}
          >
            <View style={styles.saveContent}>
              <Save size={20} color={colors.surface} />
              <Text style={[styles.saveText, { color: colors.surface }]}>
                {loading ? "Changing..." : "Change Password"}
              </Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
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
  inputIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  requirements: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 4,
  },
  actions: {
    marginBottom: 40,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
});

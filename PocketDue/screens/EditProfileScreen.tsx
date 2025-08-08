import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { ChevronLeft, User, Mail, Save } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";
import { useUser } from "../hooks/useUser";
import { Button } from "../components/Button";

interface EditProfileScreenProps {
  onBack: () => void;
}

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  onBack,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { loading, updateProfile, getCurrentUserData } = useUser();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    const userData = getCurrentUserData();
    setFormData(userData);
  }, [getCurrentUserData]);

  const handleSave = async () => {
    const success = await updateProfile({
      name: formData.name,
      email: formData.email,
    });

    if (success) {
      onBack();
    }
  };

  const renderInputField = (
    icon: React.ReactNode,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    keyboardType: "default" | "email-address" = "default"
  ) => (
    <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="words"
      />
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
          Edit Profile
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Personal Information
          </Text>
          <Text
            style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
          >
            Update your name and email address
          </Text>
        </View>

        <View style={styles.form}>
          {renderInputField(
            <User size={20} color={colors.textSecondary} />,
            "Full Name",
            formData.name,
            (text) => setFormData({ ...formData, name: text })
          )}

          {renderInputField(
            <Mail size={20} color={colors.textSecondary} />,
            "Email Address",
            formData.email,
            (text) => setFormData({ ...formData, email: text }),
            "email-address"
          )}
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
                {loading ? "Saving..." : "Save Changes"}
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
    paddingBottom: 20
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
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 12
  },
  inputIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
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

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  User,
  Mail,
  Calendar,
  Moon,
  Sun,
  LogOut,
  Trash2,
  Settings as SettingsIcon,
  Shield,
  Info,
  HelpCircle,
} from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";
import { Button } from "../components/Button";
import { useToast } from "../contexts/ToastContext";

interface SettingsScreenProps {
  onLogout: () => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onLogout,
  onBack,
}) => {
  const { theme, toggleTheme } = useTheme();
  const colors = getThemeColors(theme);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          showToast("Logged out successfully", "info");
          onLogout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            showToast("Account deletion requested", "info");
            // TODO: Implement account deletion
          },
        },
      ]
    );
  };

  const renderSectionHeader = (title: string, icon: React.ReactNode) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIcon}>{icon}</View>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        {title}
      </Text>
    </View>
  );

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    danger?: boolean
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: colors.surface },
        danger && { borderLeftColor: colors.error, borderLeftWidth: 3 },
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View
          style={[
            styles.settingIcon,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          {icon}
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
            {title}
          </Text>
          {subtitle && (
            <Text
              style={[styles.settingSubtitle, { color: colors.textSecondary }]}
            >
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent && (
        <View style={styles.settingRight}>{rightComponent}</View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradientPrimary as [string, string]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.surface }]}>
            Settings
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            "Profile",
            <User size={20} color={colors.primary} />
          )}
          {renderSettingItem(
            <User size={20} color={colors.textSecondary} />,
            "Edit Profile",
            "Update your personal information",
            () => showToast("Profile editing coming soon", "info")
          )}
          {renderSettingItem(
            <Mail size={20} color={colors.textSecondary} />,
            "Email Address",
            "nabinkhair12@gmail.com",
            () => showToast("Email editing coming soon", "info")
          )}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            "Appearance",
            <SettingsIcon size={20} color={colors.primary} />
          )}
          {renderSettingItem(
            theme === "dark" ? (
              <Moon size={20} color={colors.textSecondary} />
            ) : (
              <Sun size={20} color={colors.textSecondary} />
            ),
            "Dark Mode",
            "Switch between light and dark themes",
            undefined,
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{
                false: colors.surfaceSecondary,
                true: colors.primary,
              }}
              thumbColor={colors.surface}
            />
          )}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            "Security",
            <Shield size={20} color={colors.primary} />
          )}
          {renderSettingItem(
            <Shield size={20} color={colors.textSecondary} />,
            "Change Password",
            "Update your account password",
            () => showToast("Password change coming soon", "info")
          )}
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            "Data & Privacy",
            <Calendar size={20} color={colors.primary} />
          )}
          {renderSettingItem(
            <Calendar size={20} color={colors.textSecondary} />,
            "Export Data",
            "Download your payment history",
            () => showToast("Data export coming soon", "info")
          )}
          {renderSettingItem(
            <Trash2 size={20} color={colors.error} />,
            "Delete Account",
            "Permanently delete your account and data",
            handleDeleteAccount,
            undefined,
            true
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          {renderSectionHeader(
            "Support",
            <HelpCircle size={20} color={colors.primary} />
          )}
          {renderSettingItem(
            <HelpCircle size={20} color={colors.textSecondary} />,
            "Help & Support",
            "Get help with the app",
            () => showToast("Support coming soon", "info")
          )}
          {renderSettingItem(
            <Info size={20} color={colors.textSecondary} />,
            "About PocketDue",
            "Version 1.0.0",
            () => showToast("About coming soon", "info")
          )}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Button
            onPress={handleLogout}
            variant="danger"
            size="lg"
            style={styles.logoutButton}
          >
            <LogOut size={20} color={colors.surface} />
            <Text style={[styles.logoutText, { color: colors.surface }]}>
              Logout
            </Text>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  settingRight: {
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

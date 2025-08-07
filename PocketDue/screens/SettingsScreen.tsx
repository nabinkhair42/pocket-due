import { LinearGradient } from "expo-linear-gradient";
import {
  Calendar,
  ChevronLeft,
  Eye,
  EyeOff,
  Fingerprint,
  HelpCircle,
  Info,
  LogOut,
  Moon,
  Settings as SettingsIcon,
  Shield,
  Sun,
  Trash2,
  User,
  UserCheck,
  UserPenIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { getThemeColors } from "../lib/theme";
import { ChangePasswordScreen } from "./ChangePasswordScreen";
import { EditProfileScreen } from "./EditProfileScreen";

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
  const { logout, user } = useAuth();
  const { deleteLoading, deleteAccount } = useUser();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          onLogout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    setShowDeleteAccount(true);
  };

  const confirmDeleteAccount = async () => {
    const success = await deleteAccount(deletePassword);

    if (success) {
      setShowDeleteAccount(false);
      setDeletePassword("");
      onLogout();
    }
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
        danger && {
          borderColor: colors.error,
          borderWidth: 1,
          borderRadius: 12,
        },
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


  if (showEditProfile) {
    return <EditProfileScreen onBack={() => setShowEditProfile(false)} />;
  }

  if (showChangePassword) {
    return <ChangePasswordScreen onBack={() => setShowChangePassword(false)} />;
  }

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

      <View style={styles.mainContent}>
        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Section */}
          <View style={styles.section}>
            {renderSectionHeader(
              "Profile",
              <User size={20} color={colors.primary} />
            )}

            {renderSettingItem(
              <UserCheck size={20} color={colors.textSecondary} />,
              user?.name || "User Name",
              user?.email || "user@example.com",
              () => showToast("Profile info", "info")
            )}
            {renderSettingItem(
              <UserPenIcon size={20} color={colors.textSecondary} />,
              "Edit Profile",
              "Update your personal information",
              () => setShowEditProfile(true)
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
              <Fingerprint size={20} color={colors.textSecondary} />,
              "Change Password",
              "Update your account password",
              () => setShowChangePassword(true)
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

  
        </ScrollView>

        {/* Fixed Logout Button */}
        <View style={styles.logoutContainer}>
          <Button
            onPress={handleLogout}
            variant="danger"
            size="lg"
            style={styles.logoutButton}
          >
            <View style={styles.logoutContent}>
              <LogOut size={20} color={colors.surface} />
              <Text style={[styles.logoutText, { color: colors.surface }]}>
                Logout
              </Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteAccount}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDeleteAccount(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowDeleteAccount(false)}
              style={styles.modalCloseButton}
            >
              <ChevronLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Delete Account
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: colors.textPrimary },
                ]}
              >
                Warning
              </Text>
              <Text
                style={[
                  styles.modalSectionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                This action cannot be undone. All your data will be permanently
                deleted.
              </Text>
            </View>

            <View style={styles.modalSection}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  { color: colors.textPrimary },
                ]}
              >
                Confirm Password
              </Text>
              <Text
                style={[
                  styles.modalSectionSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Enter your password to confirm account deletion
              </Text>

              <View
                style={[
                  styles.modalInputContainer,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.modalInputIcon}>
                  <Eye size={20} color={colors.textSecondary} />
                </View>
                <TextInput
                  style={[styles.modalInput, { color: colors.textPrimary }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  secureTextEntry={!showDeletePassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowDeletePassword(!showDeletePassword)}
                  style={styles.modalEyeButton}
                >
                  {showDeletePassword ? (
                    <EyeOff size={20} color={colors.textSecondary} />
                  ) : (
                    <Eye size={20} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                onPress={() => setShowDeleteAccount(false)}
                variant="secondary"
                size="lg"
                style={styles.modalCancelButton}
              >
                <Text
                  style={[
                    styles.modalButtonText,
                    { color: colors.textPrimary },
                  ]}
                >
                  Cancel
                </Text>
              </Button>

              <Button
                onPress={confirmDeleteAccount}
                variant="danger"
                size="lg"
                style={styles.modalDeleteButton}
                disabled={deleteLoading}
              >
                <Text
                  style={[styles.modalButtonText, { color: colors.surface }]}
                >
                  {deleteLoading ? "Deleting..." : "Delete Account"}
                </Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 20,
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
    shadowOpacity: 0,
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
  logoutContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
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
  modalCloseButton: {
    padding: 8,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalSectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 12,
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
  modalInputIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
  },
  modalEyeButton: {
    padding: 4,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    marginBottom: 40,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalDeleteButton: {
    flex: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

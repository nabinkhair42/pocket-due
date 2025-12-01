import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Mail,
  Moon,
  Shield,
  Sun,
  Trash2,
  User,
  UserPen,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../components/Button";
import { Drawer } from "../components/Drawer";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { getThemeColors, spacing, radius, typography } from "../lib/theme";
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

  // Drawer states
  const [showLogoutDrawer, setShowLogoutDrawer] = useState(false);
  const [showAboutDrawer, setShowAboutDrawer] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const handleLogoutConfirm = async () => {
    setShowLogoutDrawer(false);
    await logout();
    onLogout();
  };

  const confirmDeleteAccount = async () => {
    const success = await deleteAccount(deletePassword);
    if (success) {
      setShowDeleteAccount(false);
      setDeletePassword("");
      onLogout();
    }
  };

  const openWebsite = () => {
    Linking.openURL("https://nabinkhair.com.np");
  };

  const openEmail = () => {
    Linking.openURL("mailto:nabinkhair12@gmail.com");
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.settingIcon, { backgroundColor: colors.surfaceSecondary }]}>
        {icon}
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent || (onPress && <ChevronRight size={20} color={colors.textTertiary} />)}
    </TouchableOpacity>
  );

  if (showEditProfile) {
    return <EditProfileScreen onBack={() => setShowEditProfile(false)} />;
  }

  if (showChangePassword) {
    return <ChangePasswordScreen onBack={() => setShowChangePassword(false)} />;
  }

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Account
          </Text>
          {renderSettingItem(
            <User size={18} color={colors.primary} />,
            user?.name || "User Name",
            user?.email || "user@example.com"
          )}
          {renderSettingItem(
            <UserPen size={18} color={colors.textSecondary} />,
            "Edit Profile",
            "Update your personal information",
            () => setShowEditProfile(true)
          )}
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Appearance
          </Text>
          {renderSettingItem(
            theme === "dark" ? (
              <Moon size={18} color={colors.textSecondary} />
            ) : (
              <Sun size={18} color={colors.textSecondary} />
            ),
            "Dark Mode",
            "Switch between light and dark themes",
            undefined,
            <Switch
              value={theme === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          )}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Security
          </Text>
          {renderSettingItem(
            <Shield size={18} color={colors.textSecondary} />,
            "Change Password",
            "Update your account password",
            () => setShowChangePassword(true)
          )}
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Data & Privacy
          </Text>
          {renderSettingItem(
            <Calendar size={18} color={colors.textSecondary} />,
            "Export Data",
            "Download your payment history",
            () => showToast("Data export coming soon", "info")
          )}
          {renderSettingItem(
            <Trash2 size={18} color={colors.error} />,
            "Delete Account",
            "Permanently delete your account",
            () => setShowDeleteAccount(true)
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Support
          </Text>
          {renderSettingItem(
            <HelpCircle size={18} color={colors.textSecondary} />,
            "Help & Support",
            "Get help with the app",
            () => setShowHelpDrawer(true)
          )}
          {renderSettingItem(
            <Info size={18} color={colors.textSecondary} />,
            "About PocketDue",
            "Version 1.0.0",
            () => setShowAboutDrawer(true)
          )}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            onPress={() => setShowLogoutDrawer(true)}
            variant="danger"
            size="lg"
            fullWidth
            icon={<LogOut size={18} color={colors.white} />}
          >
            Logout
          </Button>
        </View>
      </ScrollView>

      {/* Logout Drawer */}
      <Drawer
        visible={showLogoutDrawer}
        onClose={() => setShowLogoutDrawer(false)}
        height={280}
      >
        <View style={styles.drawerContent}>
          <View style={[styles.drawerIconContainer, { backgroundColor: colors.errorLight }]}>
            <LogOut size={32} color={colors.error} />
          </View>
          <Text style={[styles.drawerTitle, { color: colors.textPrimary }]}>
            Logout
          </Text>
          <Text style={[styles.drawerMessage, { color: colors.textSecondary }]}>
            Are you sure you want to logout from your account?
          </Text>
          <Button
            onPress={handleLogoutConfirm}
            variant="danger"
            size="lg"
            fullWidth
            icon={<LogOut size={18} color={colors.white} />}
          >
            Logout
          </Button>
        </View>
      </Drawer>

      {/* About Drawer */}
      <Drawer
        visible={showAboutDrawer}
        onClose={() => setShowAboutDrawer(false)}
        height={380}
      >
        <View style={styles.drawerContent}>
          <View style={[styles.drawerIconContainer, { backgroundColor: colors.primaryLight }]}>
            <Info size={32} color={colors.primary} />
          </View>
          <Text style={[styles.drawerTitle, { color: colors.textPrimary }]}>
            About PocketDue
          </Text>
          <Text style={[styles.drawerMessage, { color: colors.textSecondary }]}>
            PocketDue helps you track payments you need to make and receive. Stay organized and never miss a payment.
          </Text>

          <View style={styles.aboutInfo}>
            <View style={[styles.aboutRow, { backgroundColor: colors.surface }]}>
              <Text style={[styles.aboutLabel, { color: colors.textTertiary }]}>Version</Text>
              <Text style={[styles.aboutValue, { color: colors.textPrimary }]}>1.0.0</Text>
            </View>
            <TouchableOpacity
              style={[styles.aboutRow, { backgroundColor: colors.surface }]}
              onPress={openWebsite}
              activeOpacity={0.7}
            >
              <View style={styles.aboutRowLeft}>
                <Globe size={16} color={colors.primary} />
                <Text style={[styles.aboutLabel, { color: colors.textTertiary }]}>Developer</Text>
              </View>
              <View style={styles.aboutRowRight}>
                <Text style={[styles.aboutValue, { color: colors.primary }]}>Nabin Khair</Text>
                <ExternalLink size={14} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Drawer>

      {/* Help & Support Drawer */}
      <Drawer
        visible={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        height={340}
      >
        <View style={styles.drawerContent}>
          <View style={[styles.drawerIconContainer, { backgroundColor: colors.primaryLight }]}>
            <HelpCircle size={32} color={colors.primary} />
          </View>
          <Text style={[styles.drawerTitle, { color: colors.textPrimary }]}>
            Help & Support
          </Text>
          <Text style={[styles.drawerMessage, { color: colors.textSecondary }]}>
            Need help? Have questions or feedback? Feel free to reach out!
          </Text>

          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.surface }]}
            onPress={openEmail}
            activeOpacity={0.7}
          >
            <View style={[styles.contactIcon, { backgroundColor: colors.primaryLight }]}>
              <Mail size={20} color={colors.primary} />
            </View>
            <View style={styles.contactInfo}>
              <Text style={[styles.contactLabel, { color: colors.textTertiary }]}>Email</Text>
              <Text style={[styles.contactValue, { color: colors.primary }]}>nabinkhair12@gmail.com</Text>
            </View>
            <ExternalLink size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </Drawer>

      {/* Delete Account Modal */}
      <Modal
        visible={showDeleteAccount}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDeleteAccount(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => setShowDeleteAccount(false)}
              style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
            >
              <ChevronLeft size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
              Delete Account
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.warningBox, { backgroundColor: colors.errorLight }]}>
              <Text style={[styles.warningTitle, { color: colors.error }]}>
                Warning
              </Text>
              <Text style={[styles.warningText, { color: colors.error }]}>
                This action cannot be undone. All your data will be permanently deleted.
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: colors.textPrimary }]}>
                Confirm Password
              </Text>
              <Text style={[styles.formHint, { color: colors.textSecondary }]}>
                Enter your password to confirm account deletion
              </Text>

              <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Lock size={18} color={colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textTertiary}
                  value={deletePassword}
                  onChangeText={setDeletePassword}
                  secureTextEntry={!showDeletePassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowDeletePassword(!showDeletePassword)}>
                  {showDeletePassword ? (
                    <EyeOff size={18} color={colors.textTertiary} />
                  ) : (
                    <Eye size={18} color={colors.textTertiary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button
                onPress={() => setShowDeleteAccount(false)}
                variant="secondary"
                size="lg"
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onPress={confirmDeleteAccount}
                variant="danger"
                size="lg"
                fullWidth
                loading={deleteLoading}
              >
                Delete Account
              </Button>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...typography.bodyMedium,
  },
  settingSubtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  logoutSection: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  // Drawer styles
  drawerContent: {
    paddingHorizontal: spacing.xl,
    alignItems: "center",
  },
  drawerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  drawerTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  drawerMessage: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  aboutInfo: {
    width: "100%",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  aboutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.md,
  },
  aboutRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  aboutRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  aboutLabel: {
    ...typography.caption,
  },
  aboutValue: {
    ...typography.bodyMedium,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    ...typography.caption,
  },
  contactValue: {
    ...typography.bodyMedium,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  modalContent: {
    flex: 1,
    padding: spacing.xl,
  },
  warningBox: {
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.xxl,
  },
  warningTitle: {
    ...typography.bodySemibold,
    marginBottom: spacing.xs,
  },
  warningText: {
    ...typography.caption,
  },
  formSection: {
    marginBottom: spacing.xxl,
  },
  formLabel: {
    ...typography.bodySemibold,
    marginBottom: spacing.xs,
  },
  formHint: {
    ...typography.caption,
    marginBottom: spacing.md,
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
  modalActions: {
    gap: spacing.md,
  },
});

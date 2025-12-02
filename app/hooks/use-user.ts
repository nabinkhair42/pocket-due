import { useCallback, useState } from "react";
import { useToast } from "../contexts/toast-context";
import { apiService } from "../lib/api";
import { useAuth } from "./use-auth";

export const useUser = () => {
  const { showToast } = useToast();
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit Profile
  const updateProfile = useCallback(
    async (data: { name: string; email: string }): Promise<boolean> => {
      if (!data.name.trim() || !data.email.trim()) {
        showToast("Please fill in all fields", "error");
        return false;
      }

      if (!data.email.includes("@")) {
        showToast("Please enter a valid email address", "error");
        return false;
      }

      setLoading(true);
      try {
        const result = await apiService.updateProfile({
          name: data.name.trim(),
          email: data.email.trim(),
        });

        if (result.success && result.data?.user) {
          updateUser(result.data.user);
          showToast("Profile updated successfully", "success");
          return true;
        } else {
          showToast(result.message || "Failed to update profile", "error");
          return false;
        }
      } catch (error: any) {
        showToast(
          error.message || "Failed to update profile. Please try again.",
          "error"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast, updateUser]
  );

  // Change Password
  const changePassword = useCallback(
    async (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }): Promise<boolean> => {
      if (
        !data.currentPassword.trim() ||
        !data.newPassword.trim() ||
        !data.confirmPassword.trim()
      ) {
        showToast("Please fill in all fields", "error");
        return false;
      }

      if (data.newPassword.length < 6) {
        showToast("New password must be at least 6 characters", "error");
        return false;
      }

      if (data.newPassword !== data.confirmPassword) {
        showToast("New passwords do not match", "error");
        return false;
      }

      if (data.currentPassword === data.newPassword) {
        showToast(
          "New password must be different from current password",
          "error"
        );
        return false;
      }

      setLoading(true);
      try {
        const result = await apiService.changePassword({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });

        if (result.success) {
          showToast("Password changed successfully", "success");
          return true;
        } else {
          showToast(result.message || "Failed to change password", "error");
          return false;
        }
      } catch (error: any) {
        showToast(
          error.message || "Failed to change password. Please try again.",
          "error"
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  // Delete Account
  const deleteAccount = useCallback(
    async (password: string): Promise<boolean> => {
      if (!password.trim()) {
        showToast("Please enter your password", "error");
        return false;
      }

      setDeleteLoading(true);
      try {
        const result = await apiService.deleteAccount({ password });

        if (result.success) {
          showToast("Account deleted successfully", "success");
          await logout();
          return true;
        } else {
          showToast(result.message || "Failed to delete account", "error");
          return false;
        }
      } catch (error: any) {
        showToast(
          error.message || "Failed to delete account. Please try again.",
          "error"
        );
        return false;
      } finally {
        setDeleteLoading(false);
      }
    },
    [showToast, logout]
  );

  // Get current user data for forms
  const getCurrentUserData = useCallback(() => {
    return {
      name: user?.name || "",
      email: user?.email || "",
    };
  }, [user]);

  return {
    // State
    loading,
    deleteLoading,
    user,

    // Actions
    updateProfile,
    changePassword,
    deleteAccount,
    getCurrentUserData,
  };
};

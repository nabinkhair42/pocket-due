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
      if (!data.name.trim()) {
        showToast("Enter your name", "error");
        return false;
      }

      setLoading(true);
      try {
        const result = await apiService.updateProfile({
          name: data.name.trim(),
        });

        if (result.success && result.data?.user) {
          updateUser(result.data.user);
          showToast("Profile updated successfully", "success");
          return true;
        }
        showToast(result.message || "Failed to update profile", "error");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [showToast, updateUser]
  );

  // Delete Account
  const deleteAccount = useCallback(
    async (): Promise<boolean> => {
      setDeleteLoading(true);
      try {
        const result = await apiService.deleteAccount();

        if (result.success) {
          showToast("Account deleted", "success");
          // Clearing auth state re-renders the app to the auth screen; callers
          // must not also invoke a parent logout handler.
          await logout();
          return true;
        }
        showToast(result.message || "Unable to delete your account. Try again.", "error");
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
    deleteAccount,
    getCurrentUserData,
  };
};

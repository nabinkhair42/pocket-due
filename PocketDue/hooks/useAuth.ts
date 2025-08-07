import { useState, useCallback } from "react";
import { apiService } from "../lib/api";
import { User } from "../types/models";
import {
  ApiResponse,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
} from "../types/api";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const register = useCallback(
    async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
      setLoading(true);
      try {
        const result = await apiService.register(data);
        if (result.success && result.data?.user) {
          setUser(result.data.user);
        }
        return result;
      } catch (error) {
        return {
          success: false,
          error: "Registration failed",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
      setLoading(true);
      try {
        const result = await apiService.login(data);
        if (result.success && result.data?.user) {
          setUser(result.data.user);
        }
        return result;
      } catch (error) {
        return {
          success: false,
          error: "Login failed",
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const result = await apiService.getCurrentUser();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        return result.data.user;
      }
      return null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  }, []);

  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
  }, []);

  return {
    user,
    loading,
    register,
    login,
    logout,
    getCurrentUser,
    updateUser,
  };
};

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { authClient, SocialProvider } from "../lib/auth-client";
import { User } from "../types/models";

const CACHED_USER_KEY = "pocketdue.current-user.v2";
export type AuthStatus = "loading" | "authenticated" | "guest" | "offline";
type SignInResult = { success: boolean; error?: string };

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  loading: boolean;
  signInWithProvider: (provider: SocialProvider) => Promise<SignInResult>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
type SessionUser = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
};

const toUser = (value: SessionUser): User => ({
  _id: value.id,
  email: value.email,
  name: value.name,
  createdAt: new Date(value.createdAt ?? Date.now()).toISOString(),
  updatedAt: new Date(value.updatedAt ?? Date.now()).toISOString(),
  image: value.image ?? undefined,
});

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within an AuthProvider");
  return value;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [loading, setLoading] = useState(false);

  const resolveFromCache = useCallback(async (): Promise<User | null> => {
    const cached = await AsyncStorage.getItem(CACHED_USER_KEY);
    if (cached) {
      const cachedUser = JSON.parse(cached) as User;
      setUser(cachedUser);
      setStatus("offline");
      return cachedUser;
    }
    setStatus("guest");
    return null;
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const { data, error } = await authClient.getSession();
      if (data?.user) {
        const nextUser = toUser(data.user);
        setUser(nextUser);
        setStatus("authenticated");
        await AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(nextUser));
        return nextUser;
      }
      if (!error) {
        setUser(null);
        setStatus("guest");
        await AsyncStorage.removeItem(CACHED_USER_KEY);
        return null;
      }
      return await resolveFromCache();
    } catch {
      return await resolveFromCache();
    }
  }, [resolveFromCache]);

  useEffect(() => { void getCurrentUser(); }, [getCurrentUser]);

  const signInWithProvider = useCallback(async (provider: SocialProvider): Promise<SignInResult> => {
    setLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: Platform.OS === "web" ? window.location.origin : "pocketdue://auth/callback",
      });
      if (error) return { success: false, error: error.message || "Sign-in failed." };
      await getCurrentUser();
      return { success: true };
    } catch {
      return { success: false, error: "Can't reach the authentication service. Try again." };
    } finally { setLoading(false); }
  }, [getCurrentUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    try { await authClient.signOut(); }
    finally {
      await AsyncStorage.removeItem(CACHED_USER_KEY);
      setUser(null);
      setStatus("guest");
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    setStatus("authenticated");
    void AsyncStorage.setItem(CACHED_USER_KEY, JSON.stringify(nextUser));
  }, []);

  const value = useMemo(() => ({ user, status, loading, signInWithProvider, logout, getCurrentUser, updateUser }), [user, status, loading, signInWithProvider, logout, getCurrentUser, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

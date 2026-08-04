import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { apiService } from "../lib/api";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../types/api";
import { User } from "../types/models";

/**
 * "loading"       - initial bootstrap in flight, nothing decided yet
 * "authenticated" - we have a user
 * "guest"         - server explicitly rejected the token (401) or none stored
 * "offline"       - transport failed; a token may still be valid, do NOT log out
 */
export type AuthStatus = "loading" | "authenticated" | "guest" | "offline";

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  /** True while a login/register/logout call is in flight. */
  loading: boolean;
  register: (data: RegisterRequest) => Promise<ApiResponse<AuthResponse>>;
  login: (data: LoginRequest) => Promise<ApiResponse<AuthResponse>>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Single source of truth for "who is signed in".
   * Distinguishes an explicit 401 (-> guest) from a transport failure
   * (-> offline), so a flaky network never discards a valid session.
   */
  const bootstrap = useCallback(async () => {
    const result = await apiService.getCurrentUser();
    if (!isMounted.current) return;

    if (result.success && result.data?.user) {
      setUser(result.data.user);
      setStatus("authenticated");
      return;
    }

    if (result.error === "UNAUTHORIZED") {
      setUser(null);
      setStatus("guest");
      return;
    }

    // Network/timeout/server error: we genuinely don't know. Keep the stored
    // token and let the user retry rather than dumping them on the welcome screen.
    const hasToken = await apiService.hasToken();
    if (!isMounted.current) return;
    setUser(null);
    setStatus(hasToken ? "offline" : "guest");
  }, []);

  // One bootstrap for the whole app (previously every useAuth() call site
  // fired its own /auth/me).
  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // The transport layer detects 401s; this is how it reaches UI state.
  useEffect(() => {
    return apiService.onAuthFailure(() => {
      if (!isMounted.current) return;
      setUser(null);
      setStatus("guest");
    });
  }, []);

  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    const result = await apiService.getCurrentUser();
    if (!isMounted.current) return null;

    if (result.success && result.data?.user) {
      setUser(result.data.user);
      setStatus("authenticated");
      return result.data.user;
    }
    if (result.error === "UNAUTHORIZED") {
      setUser(null);
      setStatus("guest");
    }
    return null;
  }, []);

  const register = useCallback(
    async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
      setLoading(true);
      try {
        const result = await apiService.register(data);
        if (isMounted.current && result.success && result.data?.user) {
          setUser(result.data.user);
          setStatus("authenticated");
        }
        return result;
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
      setLoading(true);
      try {
        const result = await apiService.login(data);
        if (isMounted.current && result.success && result.data?.user) {
          setUser(result.data.user);
          setStatus("authenticated");
        }
        return result;
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    []
  );

  /**
   * The single owner of logout. Screens call this once; they must not also
   * invoke a parent onLogout that logs out again.
   */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      await apiService.logout();
    } finally {
      if (isMounted.current) {
        setUser(null);
        setStatus("guest");
        setLoading(false);
      }
    }
  }, []);

  const updateUser = useCallback((updatedUser: User): void => {
    setUser(updatedUser);
    setStatus("authenticated");
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      loading,
      register,
      login,
      logout,
      getCurrentUser,
      updateUser,
    }),
    [
      user,
      status,
      loading,
      register,
      login,
      logout,
      getCurrentUser,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

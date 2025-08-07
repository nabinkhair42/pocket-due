import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { apiService } from "./lib/api";
import { AuthScreen } from "./screens/AuthScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/ToastContext";

function AppContent() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const result = await apiService.getCurrentUser();
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = () => {
    checkAuthStatus();
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      {user ? (
        <HomeScreen onLogout={handleLogout} />
      ) : (
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      )}
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </ThemeProvider>
  );
}

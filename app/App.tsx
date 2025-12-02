import { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme, ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/toast-context";
import { apiService } from "./lib/api";
import { AuthScreen } from "./screens/auth-screen";
import { HomeScreen } from "./screens/home-screen";
import { StatusBar } from "react-native";

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

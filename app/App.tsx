import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "./components/error-boundary";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/toast-context";
import { NetworkProvider } from "./contexts/network-context";
import { AuthScreen } from "./screens/auth-screen";
import { HomeScreen } from "./screens/home-screen";

function AppContent() {
  const { user, status, getCurrentUser } = useAuth();

  if (status === "loading") {
    return null;
  }

  return user ? <HomeScreen /> : <AuthScreen onAuthSuccess={getCurrentUser} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <NetworkProvider>
              <ToastProvider>
                <AppContent />
              </ToastProvider>
            </NetworkProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

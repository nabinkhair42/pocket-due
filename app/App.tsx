import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "./components/error-boundary";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastProvider } from "./contexts/toast-context";
import { AuthScreen } from "./screens/auth-screen";
import { HomeScreen } from "./screens/home-screen";

function AppContent() {
  // Single source of truth. `status` distinguishes "server said no" from
  // "we couldn't reach the server", which decides whether to sign the user out.
  const { user, status, getCurrentUser } = useAuth();

  if (status === "loading") {
    return null;
  }

  return (
    <SafeAreaProvider>
      {user ? (
        <HomeScreen />
      ) : (
        <AuthScreen onAuthSuccess={getCurrentUser} />
      )}
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

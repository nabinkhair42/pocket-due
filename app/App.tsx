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

  return user ? <HomeScreen /> : <AuthScreen onAuthSuccess={getCurrentUser} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      {/*
        SafeAreaProvider must sit above every consumer of useSafeAreaInsets.
        ToastProvider renders the Toast as a sibling of its children, so with
        the provider nested inside AppContent the toast fell outside it and
        threw "No safe area value available". Keeping it at the root also stops
        the auth gate from unmounting and remeasuring insets on every sign-in.
      */}
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

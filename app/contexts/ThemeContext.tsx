import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>(systemColorScheme === "dark" ? "dark" : "light");
  const [isLoaded, setIsLoaded] = useState(false);
  // Null until the user picks a theme explicitly; while null we follow the OS.
  const [hasExplicitChoice, setHasExplicitChoice] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
        setHasExplicitChoice(true);
      }
      // If no saved theme, keep the system default (already set in useState)
    } catch (error) {
    } finally {
      setIsLoaded(true);
    }
  };

  // useColorScheme was only read in the useState initializer, so flipping the
  // OS to dark while the app was open changed nothing until a restart.
  useEffect(() => {
    if (hasExplicitChoice) return;
    setThemeState(systemColorScheme === "dark" ? "dark" : "light");
  }, [systemColorScheme, hasExplicitChoice]);

  const setTheme = useCallback(async (newTheme: Theme) => {
    // Update immediately; persistence must not gate the UI.
    setThemeState(newTheme);
    setHasExplicitChoice(true);
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const newTheme = current === "light" ? "dark" : "light";
      setHasExplicitChoice(true);
      AsyncStorage.setItem("theme", newTheme).catch(() => {});
      return newTheme;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme, setTheme }), [theme, toggleTheme, setTheme]);

  if (!isLoaded) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

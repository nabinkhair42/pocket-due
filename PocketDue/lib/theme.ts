import { Theme } from "../contexts/ThemeContext";

export const themeColors = {
  light: {
    // Background colors
    background: "#f9fafb",
    surface: "#ffffff",
    surfaceSecondary: "#f3f4f6",

    // Text colors
    textPrimary: "#1f2937",
    textSecondary: "#6b7280",
    textTertiary: "#9ca3af",

    // Border colors
    border: "#e5e7eb",
    borderSecondary: "#d1d5db",

    // Brand colors
    primary: "#3b82f6",
    primaryDark: "#2563eb",
    secondary: "#10b981",
    secondaryDark: "#059669",

    // Status colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    errorDark: "#dc2626",

    // Card colors
    cardBackground: "#ffffff",
    cardShadow: "rgba(0, 0, 0, 0.05)",

    // Gradient colors
    gradientPrimary: ["#3b82f6", "#2563eb"],
    gradientSecondary: ["#10b981", "#059669"],
    gradientSuccess: ["#10b981", "#059669"],
    gradientError: ["#ef4444", "#dc2626"],

    // Overlay colors
    overlay: "rgba(255, 255, 255, 0.1)",
    overlayDark: "rgba(255, 255, 255, 0.9)",
  },
  dark: {
    // Background colors
    background: "#111827",
    surface: "#1f2937",
    surfaceSecondary: "#374151",

    // Text colors
    textPrimary: "#f9fafb",
    textSecondary: "#d1d5db",
    textTertiary: "#9ca3af",

    // Border colors
    border: "#374151",
    borderSecondary: "#4b5563",

    // Brand colors
    primary: "#3b82f6",
    primaryDark: "#2563eb",
    secondary: "#10b981",
    secondaryDark: "#059669",

    // Status colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    errorDark: "#dc2626",

    // Card colors
    cardBackground: "#1f2937",
    cardShadow: "rgba(0, 0, 0, 0.3)",

    // Gradient colors
    gradientPrimary: ["#3b82f6", "#2563eb"],
    gradientSecondary: ["#10b981", "#059669"],
    gradientSuccess: ["#10b981", "#059669"],
    gradientError: ["#ef4444", "#dc2626"],
    

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.3)",
    overlayDark: "rgba(0, 0, 0, 0.9)",
  },
};

export const getThemeColors = (theme: Theme) => {
  return themeColors[theme];
};

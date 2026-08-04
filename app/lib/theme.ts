import { Theme } from "../contexts/ThemeContext";
import { Platform } from "react-native";
import type { TextStyle } from "react-native";

// Spacing scale (4px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// Border radius scale
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 9999,
} as const;

// Typography scale
export const typography = {
  h1: { fontSize: 30, fontWeight: "700" as const, lineHeight: 36, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: "600" as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: "400" as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: "500" as const, lineHeight: 24 },
  bodySemibold: { fontSize: 16, fontWeight: "600" as const, lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  captionMedium: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },
  small: { fontSize: 12, fontWeight: "500" as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: "600" as const, lineHeight: 22 },
} as const;

export const numericTextStyle: TextStyle = { fontVariant: ["tabular-nums"] };

export const themeColors = {
  light: {
    // Background colors
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceSecondary: "#F1F5F9",
    surfaceTertiary: "#E2E8F0",

    // Text colors
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    textTertiary: "#64748B",
    textDisabled: "#94A3B8",

    // Border colors
    border: "#CBD5E1",
    borderLight: "#E2E8F0",

    // Brand colors - Clean blue palette
    primary: "#1D4ED8",
    primaryLight: "#DBEAFE",
    primaryDark: "#1E40AF",

    // Accent colors
    accent: "#6D28D9",
    accentLight: "#EDE9FE",

    // Status colors - Softer, more modern
    success: "#15803D",
    successLight: "#DCFCE7",
    successDark: "#166534",

    warning: "#A16207",
    warningLight: "#FEF3C7",
    warningDark: "#854D0E",

    error: "#B91C1C",
    errorLight: "#FEE2E2",
    errorDark: "#991B1B",

    info: "#1D4ED8",
    infoLight: "#DBEAFE",

    // Card colors
    cardBackground: "#FFFFFF",
    cardShadow: "rgba(0, 0, 0, 0.04)",
    cardBorder: "#E2E8F0",

    // Gradient colors
    gradientPrimary: ["#2563EB", "#1D4ED8"],
    gradientSuccess: ["#16A34A", "#15803D"],
    gradientError: ["#DC2626", "#B91C1C"],

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(255, 255, 255, 0.9)",

    // Fixed colors
    white: "#FFFFFF",
    black: "#000000",

    // FAB colors
    fab: "#1D4ED8",
    fabIcon: "#FFFFFF",
  },
  dark: {
    // Background colors
    background: "#0B1220",
    surface: "#111827",
    surfaceSecondary: "#1F2937",
    surfaceTertiary: "#334155",

    // Text colors
    textPrimary: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textTertiary: "#94A3B8",
    textDisabled: "#64748B",

    // Border colors
    border: "#475569",
    borderLight: "#334155",

    // Brand colors - Adjusted for dark mode
    primary: "#60A5FA",
    primaryLight: "#172554",
    primaryDark: "#93C5FD",

    // Accent colors
    accent: "#A371F7",
    accentLight: "#2D2052",

    // Status colors - Adjusted for dark mode
    success: "#4ADE80",
    successLight: "#14532D",
    successDark: "#86EFAC",

    warning: "#FACC15",
    warningLight: "#422006",
    warningDark: "#FDE047",

    error: "#F87171",
    errorLight: "#450A0A",
    errorDark: "#FCA5A5",

    info: "#60A5FA",
    infoLight: "#172554",

    // Card colors
    cardBackground: "#161B22",
    cardShadow: "rgba(0, 0, 0, 0.3)",
    cardBorder: "#334155",

    // Gradient colors
    gradientPrimary: ["#60A5FA", "#3B82F6"],
    gradientSuccess: ["#86EFAC", "#4ADE80"],
    gradientError: ["#FCA5A5", "#F87171"],

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.7)",
    overlayLight: "rgba(22, 27, 34, 0.95)",

    // Fixed colors
    white: "#FFFFFF",
    black: "#000000",

    // FAB colors
    fab: "#1D4ED8",
    fabIcon: "#FFFFFF",
  },
};

export const getThemeColors = (theme: Theme) => {
  return themeColors[theme];
};

// Shadow presets
export const shadows = {
  sm: Platform.select({
    web: { boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)" },
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
    android: { elevation: 1 },
  }),
  md: Platform.select({
    web: { boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)" },
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
    android: { elevation: 2 },
  }),
  lg: Platform.select({
    web: { boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)" },
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    android: { elevation: 4 },
  }),
} as const;

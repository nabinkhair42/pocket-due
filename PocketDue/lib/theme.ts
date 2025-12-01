import { Theme } from "../contexts/ThemeContext";

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
  h1: { fontSize: 28, fontWeight: "700" as const, lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: "600" as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: "600" as const, lineHeight: 24 },
  body: { fontSize: 15, fontWeight: "400" as const, lineHeight: 22 },
  bodyMedium: { fontSize: 15, fontWeight: "500" as const, lineHeight: 22 },
  bodySemibold: { fontSize: 15, fontWeight: "600" as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: "400" as const, lineHeight: 18 },
  captionMedium: { fontSize: 13, fontWeight: "500" as const, lineHeight: 18 },
  small: { fontSize: 11, fontWeight: "500" as const, lineHeight: 14 },
  button: { fontSize: 15, fontWeight: "600" as const, lineHeight: 20 },
} as const;

export const themeColors = {
  light: {
    // Background colors
    background: "#F8F9FA",
    surface: "#FFFFFF",
    surfaceSecondary: "#F1F3F5",
    surfaceTertiary: "#E9ECEF",

    // Text colors
    textPrimary: "#212529",
    textSecondary: "#495057",
    textTertiary: "#868E96",
    textDisabled: "#ADB5BD",

    // Border colors
    border: "#DEE2E6",
    borderLight: "#E9ECEF",

    // Brand colors - Clean blue palette
    primary: "#228BE6",
    primaryLight: "#E7F5FF",
    primaryDark: "#1C7ED6",

    // Accent colors
    accent: "#7950F2",
    accentLight: "#F3F0FF",

    // Status colors - Softer, more modern
    success: "#40C057",
    successLight: "#EBFBEE",
    successDark: "#37B24D",

    warning: "#FAB005",
    warningLight: "#FFF9DB",
    warningDark: "#F59F00",

    error: "#FA5252",
    errorLight: "#FFF5F5",
    errorDark: "#F03E3E",

    info: "#228BE6",
    infoLight: "#E7F5FF",

    // Card colors
    cardBackground: "#FFFFFF",
    cardShadow: "rgba(0, 0, 0, 0.04)",
    cardBorder: "#F1F3F5",

    // Gradient colors
    gradientPrimary: ["#339AF0", "#228BE6"],
    gradientSuccess: ["#51CF66", "#40C057"],
    gradientError: ["#FF6B6B", "#FA5252"],

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(255, 255, 255, 0.9)",

    // Fixed colors
    white: "#FFFFFF",
    black: "#000000",

    // FAB colors
    fab: "#228BE6",
    fabIcon: "#FFFFFF",
  },
  dark: {
    // Background colors
    background: "#0D1117",
    surface: "#161B22",
    surfaceSecondary: "#21262D",
    surfaceTertiary: "#30363D",

    // Text colors
    textPrimary: "#F0F6FC",
    textSecondary: "#8B949E",
    textTertiary: "#6E7681",
    textDisabled: "#484F58",

    // Border colors
    border: "#30363D",
    borderLight: "#21262D",

    // Brand colors - Adjusted for dark mode
    primary: "#58A6FF",
    primaryLight: "#1F3A5F",
    primaryDark: "#388BFD",

    // Accent colors
    accent: "#A371F7",
    accentLight: "#2D2052",

    // Status colors - Adjusted for dark mode
    success: "#3FB950",
    successLight: "#1B4332",
    successDark: "#2EA043",

    warning: "#D29922",
    warningLight: "#3D2E00",
    warningDark: "#BB8009",

    error: "#F85149",
    errorLight: "#4A1D1D",
    errorDark: "#DA3633",

    info: "#58A6FF",
    infoLight: "#1F3A5F",

    // Card colors
    cardBackground: "#161B22",
    cardShadow: "rgba(0, 0, 0, 0.3)",
    cardBorder: "#30363D",

    // Gradient colors
    gradientPrimary: ["#58A6FF", "#388BFD"],
    gradientSuccess: ["#56D364", "#3FB950"],
    gradientError: ["#FF7B72", "#F85149"],

    // Overlay colors
    overlay: "rgba(0, 0, 0, 0.7)",
    overlayLight: "rgba(22, 27, 34, 0.95)",

    // Fixed colors
    white: "#FFFFFF",
    black: "#000000",

    // FAB colors
    fab: "#58A6FF",
    fabIcon: "#FFFFFF",
  },
};

export const getThemeColors = (theme: Theme) => {
  return themeColors[theme];
};

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

import { Check, X, Info } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius, typography } from "../lib/theme";

export type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant: ToastVariant;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant,
  visible,
  onClose,
  duration = 3000,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const translateY = useRef(new Animated.Value(100)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Safe bottom padding for different platforms
  const bottomPadding = Platform.OS === "ios" ? 34 : 16;

  useEffect(() => {
    if (visible) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Slide up from bottom
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    } else {
      translateY.setValue(100);
    }
    // `message`/`variant` are dependencies too: a second toast raised while one
    // is still showing doesn't change `visible`, so without them the first
    // toast's timer would survive and cut the new message short.
  }, [visible, message, variant, duration]);

  const hideToast = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const getVariantConfig = () => {
    switch (variant) {
      case "success":
        return {
          iconColor: colors.success,
          icon: Check,
        };
      case "error":
        return {
          iconColor: colors.error,
          icon: X,
        };
      case "info":
      default:
        return {
          iconColor: colors.primary,
          icon: Info,
        };
    }
  };

  if (!visible) return null;

  const config = getVariantConfig();
  const IconComponent = config.icon;

  // Snackbar style: dark background in light mode, light background in dark mode
  const snackbarBg = theme === "light" ? colors.textPrimary : colors.surface;
  const snackbarText = theme === "light" ? colors.white : colors.textPrimary;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: bottomPadding + spacing.lg,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={hideToast}
        style={[
          styles.toast,
          { backgroundColor: snackbarBg },
        ]}
      >
        <IconComponent size={18} color={config.iconColor} />
        <Text
          style={[styles.message, { color: snackbarText }]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 9999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.md,
    minHeight: 44,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    flex: 1,
    ...typography.bodyMedium,
  },
});

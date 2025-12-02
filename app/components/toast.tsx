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

  // Safe bottom padding for different platforms
  const bottomPadding = Platform.OS === "ios" ? 34 : 16;

  useEffect(() => {
    if (visible) {
      // Slide up from bottom
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(100);
    }
  }, [visible]);

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
  },
  message: {
    flex: 1,
    ...typography.bodyMedium,
  },
});

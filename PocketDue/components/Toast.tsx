import { CheckCircle2, AlertCircle, Info } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
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
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-100);
      opacity.setValue(0);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getVariantConfig = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: colors.surface,
          borderColor: colors.success,
          iconColor: colors.success,
          textColor: colors.textPrimary,
          icon: CheckCircle2,
        };
      case "error":
        return {
          backgroundColor: colors.surface,
          borderColor: colors.error,
          iconColor: colors.error,
          textColor: colors.textPrimary,
          icon: AlertCircle,
        };
      case "info":
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          iconColor: colors.primary,
          textColor: colors.textPrimary,
          icon: Info,
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideToast}
            style={[
              styles.toast,
              {
                backgroundColor: config.backgroundColor,
                borderLeftColor: config.borderColor,
                shadowColor: colors.black,
              },
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${config.iconColor}15` }]}>
              <IconComponent size={18} color={config.iconColor} />
            </View>
            <Text
              style={[styles.message, { color: config.textColor }]}
              numberOfLines={2}
            >
              {message}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  container: {
    position: "absolute",
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    gap: spacing.md,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    flex: 1,
    ...typography.bodyMedium,
  },
});

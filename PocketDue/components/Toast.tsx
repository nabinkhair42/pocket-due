import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Check, XCircle, Info, X } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";

const { width } = Dimensions.get("window");

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
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          backgroundColor: colors.success,
          icon: <Check size={20} color={colors.surface} />,
        };
      case "error":
        return {
          backgroundColor: colors.error,
          icon: <XCircle size={20} color={colors.surface} />,
        };
      case "info":
        return {
          backgroundColor: colors.primary,
          icon: <Info size={20} color={colors.surface} />,
        };
      default:
        return {
          backgroundColor: colors.primary,
          icon: <Info size={20} color={colors.surface} />,
        };
    }
  };

  const variantStyles = getVariantStyles();

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: variantStyles.backgroundColor,
            shadowColor: variantStyles.backgroundColor,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>{variantStyles.icon}</View>
            <Text style={[styles.message, { color: colors.surface }]}>
              {message}
            </Text>
          </View>
          <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
            <X size={16} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});

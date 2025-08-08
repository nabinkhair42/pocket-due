import React from "react";
import {
  GestureResponderEvent,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";

interface ButtonProps {
  size?: "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const sizeStyles = {
  sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 12 },
  md: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
  lg: { paddingVertical: 10, paddingHorizontal: 20, fontSize: 16 },
  xl: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 18 },
};

export const Button = ({
  size = "md",
  icon,
  variant = "primary",
  children,
  onPress,
  disabled = false,
  style,
}: ButtonProps) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
          borderColor: "transparent",
          textColor: colors.surface,
        };
      case "secondary":
        return {
          backgroundColor: colors.secondary,
          borderColor: "transparent",
          textColor: colors.surface,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.border,
          textColor: colors.textPrimary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          textColor: colors.textPrimary,
        };
      case "danger":
        return {
          backgroundColor: colors.error,
          borderColor: "transparent",
          textColor: colors.surface,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: "transparent",
          textColor: colors.surface,
        };
    }
  };

  const sizeStyle = sizeStyles[size];
  const variantStyle = getVariantStyles();

  const buttonStyle: ViewStyle = {
    backgroundColor: variantStyle.backgroundColor,
    borderColor: variantStyle.borderColor,
    borderWidth: variant === "outline" ? 1 : 0,
    paddingVertical: sizeStyle.paddingVertical,
    paddingHorizontal: sizeStyle.paddingHorizontal,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const textStyle: TextStyle = {
    color: variantStyle.textColor,
    fontSize: sizeStyle.fontSize,
    fontWeight: "600",
    marginLeft: icon ? 8 : 0,
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={textStyle}>{children}</Text>
      {icon && <View>{icon}</View>}
    </TouchableOpacity>
  );
};

import React from "react";
import {
  GestureResponderEvent,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius, typography } from "../lib/theme";

interface ButtonProps {
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const sizeConfig = {
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    ...typography.caption,
    iconSize: 16,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    ...typography.button,
    iconSize: 18,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    ...typography.button,
    iconSize: 20,
  },
};

export const Button = ({
  size = "md",
  icon,
  iconPosition = "left",
  variant = "primary",
  children,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: ButtonProps) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const config = sizeConfig[size] || sizeConfig.md;

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.white,
        };
      case "secondary":
        return {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.surfaceSecondary,
          textColor: colors.textPrimary,
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
          textColor: colors.primary,
        };
      case "danger":
        return {
          backgroundColor: colors.error,
          borderColor: colors.error,
          textColor: colors.white,
        };
      default:
        return {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
          textColor: colors.white,
        };
    }
  };

  const variantStyle = getVariantStyles();
  const isDisabled = disabled || loading;

  const buttonStyle: ViewStyle = {
    backgroundColor: variantStyle.backgroundColor,
    borderColor: variantStyle.borderColor,
    borderWidth: variant === "outline" ? 1.5 : 0,
    paddingVertical: config.paddingVertical,
    paddingHorizontal: config.paddingHorizontal,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    opacity: isDisabled ? 0.5 : 1,
    ...(fullWidth && { width: "100%" }),
    ...style,
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={variantStyle.textColor} />;
    }

    return (
      <>
        {icon && iconPosition === "left" && <View>{icon}</View>}
        <Text
          style={{
            color: variantStyle.textColor,
            fontSize: config.fontSize,
            fontWeight: config.fontWeight,
            lineHeight: config.lineHeight,
          }}
        >
          {children}
        </Text>
        {icon && iconPosition === "right" && <View>{icon}</View>}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

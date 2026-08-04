import { Check, Info, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, radius, spacing, typography } from "../lib/theme";

export type ToastVariant = "success" | "error" | "info";

interface ToastProps {
  message: string;
  variant: ToastVariant;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

const HIDDEN_OFFSET = 120;

/**
 * iOS-only fallback. Android uses the platform toast (see toast-context), which
 * the OS draws in its own window above the keyboard; iOS ships no equivalent,
 * so this one has to track the keyboard itself or it sits underneath it.
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  variant,
  visible,
  onClose,
  duration = 3000,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(HIDDEN_OFFSET)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  // Read through a ref so the keyboard listeners never capture a stale closure.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // `keyboardWillChangeFrame` covers show, hide, height changes (autocomplete
  // bar, split keyboard) and interactive dismissal in one event, and fires
  // before the frame lands so the toast rides up with it rather than lagging.
  useEffect(() => {
    // These two events are iOS-only. Android uses the platform toast and web
    // has no keyboard overlay, so neither needs a subscription here.
    if (Platform.OS !== "ios") return;

    const onFrameChange = Keyboard.addListener(
      "keyboardWillChangeFrame",
      (event) => {
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const onHide = Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      onFrameChange.remove();
      onHide.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      translateY.setValue(HIDDEN_OFFSET);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 300,
    }).start();

    timerRef.current = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: HIDDEN_OFFSET,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onCloseRef.current();
      });
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // `message`/`variant` are dependencies too: a second toast raised while one
    // is still showing doesn't change `visible`, so without them the first
    // toast's timer would survive and cut the new message short.
  }, [visible, message, variant, duration, translateY]);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(translateY, {
      toValue: HIDDEN_OFFSET,
      duration: 160,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onCloseRef.current();
    });
  };

  if (!visible) return null;

  const variantConfig = {
    success: { icon: Check, iconColor: colors.success },
    error: { icon: X, iconColor: colors.error },
    info: { icon: Info, iconColor: colors.primary },
  }[variant];

  const IconComponent = variantConfig.icon;

  // Snackbar convention: inverted surface so it reads as an overlay, not a card.
  const snackbarBg = theme === "light" ? colors.textPrimary : colors.surface;
  const snackbarText = theme === "light" ? colors.white : colors.textPrimary;

  // Sit above the keyboard when it's up; above the home indicator when it isn't.
  const bottom =
    (keyboardHeight > 0 ? keyboardHeight : insets.bottom) + spacing.lg;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.container, { bottom, transform: [{ translateY }] }]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={dismiss}
        style={[styles.toast, { backgroundColor: snackbarBg }]}
        accessibilityRole="alert"
        accessibilityLabel={message}
      >
        <IconComponent size={18} color={variantConfig.iconColor} />
        <Text style={[styles.message, { color: snackbarText }]} numberOfLines={2}>
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

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius } from "../lib/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAG_THRESHOLD = 100;
const USE_NATIVE_DRIVER = Platform.OS !== "web";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
}

export const Drawer: React.FC<DrawerProps> = ({
  visible,
  onClose,
  children,
  height,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(visible);

  // Calculate drawer height - use provided height or auto-size
  const drawerHeight = height || SCREEN_HEIGHT * 0.5;

  const animateOut = useCallback(
    (onDone?: () => void) => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: drawerHeight,
          duration: 200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsRendered(false);
          onDone?.();
        }
      });
    },
    [drawerHeight, translateY, backdropOpacity]
  );

  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      // Reset position before animating in
      translateY.setValue(drawerHeight);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: USE_NATIVE_DRIVER,
          damping: 25,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]).start();
    } else if (isRendered) {
      animateOut();
    }
  }, [visible, drawerHeight]);

  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const visibleDrawerHeight = Math.min(
    drawerHeight,
    Math.max(300, SCREEN_HEIGHT - keyboardHeight)
  );

  const closeDrawer = useCallback(() => {
    animateOut(onClose);
  }, [animateOut, onClose]);

  const closeDrawerRef = useRef(closeDrawer);
  closeDrawerRef.current = closeDrawer;

  const panResponderRef = useRef<ReturnType<
    typeof PanResponder.create
  > | null>(null);
  if (panResponderRef.current === null) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD || gestureState.vy > 0.5) {
          closeDrawerRef.current();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: USE_NATIVE_DRIVER,
            damping: 25,
            stiffness: 200,
          }).start();
        }
      },
    });
  }
  const panResponder = panResponderRef.current;

  if (!visible && !isRendered) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Close drawer"
          onPress={closeDrawer}
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        />

        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.background,
              height: visibleDrawerHeight,
              paddingBottom: insets.bottom,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.content}>
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  drawer: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.12)" },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
  },
  content: {
    flex: 1,
  },
});

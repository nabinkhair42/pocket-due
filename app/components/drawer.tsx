import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius } from "../lib/theme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const DRAG_THRESHOLD = 100;

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

  // Calculate drawer height - use provided height or auto-size
  const drawerHeight = height || SCREEN_HEIGHT * 0.5;

  useEffect(() => {
    if (visible) {
      // Reset position before animating in
      translateY.setValue(drawerHeight);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 25,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, drawerHeight]);

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: drawerHeight,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
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
          closeDrawer();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 25,
            stiffness: 200,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropOpacity },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.drawer,
            {
              backgroundColor: colors.background,
              height: drawerHeight,
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
  },
  handleContainer: {
    alignItems: "center",
    paddingVertical: spacing.md,
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

import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue, Platform, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, radius } from "../lib/theme";

const PULSE_MIN = 0.35;
const PULSE_MAX = 0.75;
const HALF_CYCLE_MS = 700;
export const STAGGER_MS = 90;
const USE_NATIVE_DRIVER = Platform.OS !== "web";

export const usePulse = (delay = 0) => {
  const opacity = useRef(new Animated.Value(PULSE_MIN)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: PULSE_MAX,
            duration: HALF_CYCLE_MS,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(opacity, {
            toValue: PULSE_MIN,
            duration: HALF_CYCLE_MS,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ])
      ),
    ]);

    animation.start();
    return () => animation.stop();
  }, [opacity, delay]);

  return opacity;
};

interface SkeletonProps {
  width: DimensionValue;
  height: number;
  opacity?: Animated.AnimatedInterpolation<number> | Animated.Value;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  opacity,
  circle = false,
  style,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const ownPulse = usePulse(0);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: circle ? radius.full : radius.sm,
          backgroundColor: colors.surfaceSecondary,
          opacity: opacity ?? ownPulse,
        },
        style,
      ]}
    />
  );
};

export const variedWidth = (index: number, widths: number[]): number =>
  widths[index % widths.length];

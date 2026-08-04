import React, { useEffect, useRef } from "react";
import { Animated, DimensionValue, StyleProp, ViewStyle } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, radius } from "../lib/theme";

const PULSE_MIN = 0.35;
const PULSE_MAX = 0.75;
const HALF_CYCLE_MS = 700;
/** Offset per row so the list breathes as a wave instead of blinking in unison. */
export const STAGGER_MS = 90;

/**
 * One pulse driver per block, started after `delay` so rows fall out of phase.
 * Wrapping the loop in a sequence delays only the *start* — putting the delay
 * inside the loop would re-pause every cycle and drift the rows apart.
 */
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
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: PULSE_MIN,
            duration: HALF_CYCLE_MS,
            useNativeDriver: true,
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
  /** Shared so a whole card pulses together; omit for a standalone block. */
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

/**
 * Real lists have ragged edges — names and amounts differ in length. Repeating
 * one identical row reads as a stuck screen rather than a loading one, so each
 * placeholder row varies deterministically by index.
 */
export const variedWidth = (index: number, widths: number[]): number =>
  widths[index % widths.length];

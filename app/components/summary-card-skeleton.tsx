import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius } from "../lib/theme";

interface SummaryCardSkeletonProps {
  count?: number;
}

const SkeletonItem: React.FC = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const skeletonColor = colors.surfaceSecondary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.personInfo}>
          <Animated.View
            style={[styles.avatar, { backgroundColor: skeletonColor, opacity }]}
          />
          <Animated.View
            style={[styles.skeletonName, { backgroundColor: skeletonColor, opacity }]}
          />
        </View>
        <Animated.View
          style={[styles.skeletonAmount, { backgroundColor: skeletonColor, opacity }]}
        />
      </View>
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Animated.View
            style={[styles.skeletonLabel, { backgroundColor: skeletonColor, opacity }]}
          />
          <Animated.View
            style={[styles.skeletonValue, { backgroundColor: skeletonColor, opacity }]}
          />
        </View>
        <View style={styles.detailRow}>
          <Animated.View
            style={[styles.skeletonLabel, { backgroundColor: skeletonColor, opacity }]}
          />
          <Animated.View
            style={[styles.skeletonValue, { backgroundColor: skeletonColor, opacity }]}
          />
        </View>
      </View>
    </View>
  );
};

export const SummaryCardSkeleton: React.FC<SummaryCardSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <View style={styles.container}>
      {[...Array(count)].map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.md,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
  },
  skeletonName: {
    height: 16,
    width: 100,
    borderRadius: radius.sm,
  },
  skeletonAmount: {
    height: 18,
    width: 80,
    borderRadius: radius.sm,
  },
  details: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonLabel: {
    height: 14,
    width: 70,
    borderRadius: radius.sm,
  },
  skeletonValue: {
    height: 14,
    width: 60,
    borderRadius: radius.sm,
  },
});

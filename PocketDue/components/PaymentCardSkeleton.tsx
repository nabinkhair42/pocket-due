import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius } from "../lib/theme";

interface PaymentCardSkeletonProps {
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
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.personInfo}>
          <Animated.View
            style={[styles.avatar, { backgroundColor: skeletonColor, opacity }]}
          />
          <View style={styles.personDetails}>
            <Animated.View
              style={[styles.skeletonName, { backgroundColor: skeletonColor, opacity }]}
            />
            <Animated.View
              style={[styles.skeletonDate, { backgroundColor: skeletonColor, opacity }]}
            />
          </View>
        </View>
        <View style={styles.amountSection}>
          <Animated.View
            style={[styles.skeletonAmount, { backgroundColor: skeletonColor, opacity }]}
          />
          <Animated.View
            style={[styles.skeletonBadge, { backgroundColor: skeletonColor, opacity }]}
          />
        </View>
      </View>
      <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
        <Animated.View
          style={[styles.skeletonAction, { backgroundColor: skeletonColor, opacity }]}
        />
        <Animated.View
          style={[styles.skeletonAction, { backgroundColor: skeletonColor, opacity }]}
        />
      </View>
    </View>
  );
};

export const PaymentCardSkeleton: React.FC<PaymentCardSkeletonProps> = ({
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
    alignItems: "flex-start",
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
  },
  personDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  skeletonName: {
    height: 16,
    width: 100,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  skeletonDate: {
    height: 12,
    width: 70,
    borderRadius: radius.sm,
  },
  amountSection: {
    alignItems: "flex-end",
  },
  skeletonAmount: {
    height: 18,
    width: 80,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  skeletonBadge: {
    height: 20,
    width: 60,
    borderRadius: radius.sm,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  skeletonAction: {
    height: 28,
    width: 60,
    borderRadius: radius.sm,
  },
});

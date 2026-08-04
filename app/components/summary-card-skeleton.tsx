import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, radius, spacing } from "../lib/theme";
import { Skeleton, STAGGER_MS, usePulse, variedWidth } from "./skeleton";

interface SummaryCardSkeletonProps {
  count?: number;
}

const NAME_WIDTHS = [96, 124, 84, 110];
const TOTAL_WIDTHS = [78, 92, 68, 86];

const SkeletonItem: React.FC<{ index: number }> = ({ index }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const opacity = usePulse(index * STAGGER_MS);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.personInfo}>
          <Skeleton width={36} height={36} circle opacity={opacity} />
          <Skeleton
            width={variedWidth(index, NAME_WIDTHS)}
            height={15}
            opacity={opacity}
          />
        </View>
        <Skeleton
          width={variedWidth(index, TOTAL_WIDTHS)}
          height={18}
          opacity={opacity}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Skeleton width={68} height={13} opacity={opacity} />
          <Skeleton width={56} height={13} opacity={opacity} />
        </View>
        <View style={styles.detailRow}>
          <Skeleton width={52} height={13} opacity={opacity} />
          <Skeleton width={62} height={13} opacity={opacity} />
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
        <Skeleton width={74} height={12} opacity={opacity} />
      </View>
    </View>
  );
};

export const SummaryCardSkeleton: React.FC<SummaryCardSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading summaries"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonItem key={index} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.lg,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
  details: {
    gap: spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
});

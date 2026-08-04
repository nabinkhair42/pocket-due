import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, radius, spacing } from "../lib/theme";
import { Skeleton, STAGGER_MS, usePulse, variedWidth } from "./skeleton";

interface PaymentCardSkeletonProps {
  count?: number;
}

const NAME_WIDTHS = [104, 132, 88, 118];
const DATE_WIDTHS = [64, 76, 58, 70];
const AMOUNT_WIDTHS = [72, 88, 64, 80];

const SkeletonItem: React.FC<{ index: number }> = ({ index }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const opacity = usePulse(index * STAGGER_MS);

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.header}>
        <View style={styles.personInfo}>
          <Skeleton width={40} height={40} circle opacity={opacity} />
          <View style={styles.personDetails}>
            <Skeleton
              width={variedWidth(index, NAME_WIDTHS)}
              height={15}
              opacity={opacity}
            />
            <Skeleton
              width={variedWidth(index, DATE_WIDTHS)}
              height={11}
              opacity={opacity}
              style={styles.dueDate}
            />
          </View>
        </View>
        <View style={styles.amountSection}>
          <Skeleton
            width={variedWidth(index, AMOUNT_WIDTHS)}
            height={18}
            opacity={opacity}
          />
          <Skeleton
            width={62}
            height={20}
            opacity={opacity}
            style={styles.badge}
          />
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
        <Skeleton width={62} height={28} opacity={opacity} />
        <Skeleton width={70} height={28} opacity={opacity} />
      </View>
    </View>
  );
};

export const PaymentCardSkeleton: React.FC<PaymentCardSkeletonProps> = ({
  count = 3,
}) => {
  return (
    <View
      style={styles.container}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading payments"
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonItem key={index} index={index} />
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
  personDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  dueDate: {
    marginTop: 6,
  },
  amountSection: {
    alignItems: "flex-end",
  },
  badge: {
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
});

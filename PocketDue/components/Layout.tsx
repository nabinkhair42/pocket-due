import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ViewStyle,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, typography, radius } from "../lib/theme";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  showHeader?: boolean;
  contentStyle?: ViewStyle;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  onBack,
  headerRight,
  showHeader = true,
  contentStyle,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {showHeader && (
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            )}
            {title && (
              <Text style={[styles.title, { color: colors.textPrimary }]}>
                {title}
              </Text>
            )}
          </View>
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}

      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...typography.h2,
  },
  content: {
    flex: 1,
  },
});

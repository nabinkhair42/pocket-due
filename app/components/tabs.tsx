import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius, typography, shadows } from "../lib/theme";

interface TabsProps {
  currentTab: "to_pay" | "to_receive";
  onTabChange: (tab: "to_pay" | "to_receive") => void;
}

export const Tabs: React.FC<TabsProps> = ({ currentTab, onTabChange }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  const tabs = [
    { id: "to_pay" as const, label: "To Pay", icon: ArrowUpRight },
    { id: "to_receive" as const, label: "To Receive", icon: ArrowDownLeft },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        const Icon = tab.icon;

        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              isActive && [
                styles.activeTab,
                { backgroundColor: colors.surface },
                shadows.sm,
              ],
            ]}
            onPress={() => onTabChange(tab.id)}
            activeOpacity={0.7}
          >
            <Icon
              size={16}
              color={isActive ? colors.primary : colors.textTertiary}
            />
            <Text
              style={[
                styles.tabText,
                { color: colors.textTertiary },
                isActive && { color: colors.textPrimary },
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: radius.md,
    padding: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  activeTab: {},
  tabText: {
    ...typography.bodyMedium,
  },
});

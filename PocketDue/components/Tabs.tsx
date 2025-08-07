import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";

interface TabsProps {
  currentTab: "to_pay" | "to_receive";
  onTabChange: (tab: "to_pay" | "to_receive") => void;
}

export const Tabs: React.FC<TabsProps> = ({ currentTab, onTabChange }) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surfaceSecondary }]}
    >
      <TouchableOpacity
        style={[
          styles.tab,
          currentTab === "to_pay" && [
            styles.activeTab,
            {
              backgroundColor: colors.cardBackground,
              shadowColor: colors.cardShadow,
            },
          ],
        ]}
        onPress={() => onTabChange("to_pay")}
      >
        <Text
          style={[
            styles.tabText,
            { color: colors.textSecondary },
            currentTab === "to_pay" && [
              styles.activeTabText,
              { color: colors.textPrimary },
            ],
          ]}
        >
          To Pay
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          currentTab === "to_receive" && [
            styles.activeTab,
            {
              backgroundColor: colors.cardBackground,
              shadowColor: colors.cardShadow,
            },
          ],
        ]}
        onPress={() => onTabChange("to_receive")}
      >
        <Text
          style={[
            styles.tabText,
            { color: colors.textSecondary },
            currentTab === "to_receive" && [
              styles.activeTabText,
              { color: colors.textPrimary },
            ],
          ]}
        >
          To Receive
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "600",
  },
});

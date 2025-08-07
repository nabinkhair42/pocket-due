import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getThemeColors } from "../lib/theme";
import { useTheme } from "../contexts/ThemeContext";

interface DropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: string[];
  disabled?: boolean;
}

const { width } = Dimensions.get("window");

export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onValueChange,
  placeholder,
  options,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
    setSearchText("");
  };

  const handleOpen = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selector,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
          disabled && styles.disabled,
        ]}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectorText,
            {
              color: value ? colors.textPrimary : colors.textSecondary,
            },
          ]}
        >
          {value || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <Animated.View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
                opacity: slideAnim,
              },
            ]}
          >
            <View
              style={[
                styles.searchContainer,
                { borderBottomColor: colors.border },
              ]}
            >
              <Ionicons
                name="search"
                size={16}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search previous users..."
                placeholderTextColor={colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    { borderBottomColor: colors.borderSecondary },
                    value === item && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          value === item ? colors.surface : colors.textPrimary,
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.optionsList}
            />

            {filteredOptions.length === 0 && (
              <View style={styles.emptyState}>
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No previous users found
                </Text>
              </View>
            )}
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
  },
  selectorText: {
    fontSize: 16,
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    width: width - 40,
    maxHeight: 250,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  optionsList: {
    maxHeight: 200,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 16,
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});

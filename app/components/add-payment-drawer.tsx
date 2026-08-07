import DateTimePicker from "@react-native-community/datetimepicker";
import { ArrowDownLeft, ArrowUpRight, Calendar, ChevronDown, DollarSign, FileText, User, Check } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { apiService } from "../lib/api";
import { offlinePayments } from "../lib/offline-payments";
import { getThemeColors, spacing, radius, typography, shadows, numericTextStyle } from "../lib/theme";
import { CreatePaymentRequest } from "../types/api";
import { Payment } from "../types/models";
import { Button } from "./button";
import { Drawer } from "./drawer";

interface AddPaymentDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest) => void | Promise<void>;
  editingPayment?: Payment | null;
  defaultType?: CreatePaymentRequest["type"];
}

export const AddPaymentDrawer: React.FC<AddPaymentDrawerProps> = ({
  visible,
  onClose,
  onSubmit,
  editingPayment,
  defaultType = "to_pay",
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    type: defaultType,
    personName: "",
    amount: 0,
    dueDate: new Date(),
    description: "",
  });
  const [amountText, setAmountText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [previousUsers, setPreviousUsers] = useState<string[]>([]);

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  const filteredOptions = useMemo(
    () =>
      previousUsers.filter((option) =>
        option.toLowerCase().includes(searchText.toLowerCase())
      ),
    [previousUsers, searchText]
  );

  useEffect(() => {
    // Reset dropdown state when drawer opens/closes
    setIsDropdownOpen(false);
    setSearchText("");
    setSubmitting(false);

    if (editingPayment) {
      setFormData({
        type: editingPayment.type,
        personName: editingPayment.personName,
        amount: editingPayment.amount,
        dueDate: new Date(editingPayment.dueDate),
        description: editingPayment.description || "",
      });
      setAmountText(
        editingPayment.amount ? String(editingPayment.amount) : ""
      );
    } else {
      setFormData({
        type: defaultType,
        personName: "",
        amount: 0,
        dueDate: new Date(),
        description: "",
      });
      setAmountText("");
    }
  }, [editingPayment, visible, defaultType]);

  // Load previous users when drawer opens
  useEffect(() => {
    if (visible && !editingPayment) {
      loadPreviousUsers();
    }
  }, [visible, editingPayment]);

  const loadPreviousUsers = async () => {
    try {
      const response = await apiService.getPreviousUsers();
      if (response.success && response.data?.previousUsers) {
        setPreviousUsers(response.data.previousUsers);
      } else if (offlinePayments.isConnectivityError(response.error)) {
        const cached = await offlinePayments.loadPayments();
        setPreviousUsers([...new Set(cached.map((payment) => payment.personName))].sort());
      }
    } catch (error) {
      // Silently fail - previous users are optional
    }
  };

  const handlePersonNameSelect = (selectedValue: string) => {
    setFormData({ ...formData, personName: selectedValue });
    setIsDropdownOpen(false);
    setSearchText("");
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!formData.personName.trim()) {
      return;
    }

    const parsedAmount = parseFloat(amountText.replace(",", "."));
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ ...formData, amount: parsedAmount });
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled =
    submitting ||
    !formData.personName.trim() ||
    !Number.isFinite(parseFloat(amountText.replace(",", ".")));

  const addQuickAmount = (increment: number) => {
    const current = parseFloat(amountText.replace(",", "."));
    const base = Number.isFinite(current) ? current : 0;
    setAmountText(String(Number((base + increment).toFixed(2))));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Drawer
      visible={visible}
      onClose={onClose}
      height={680}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {editingPayment ? "Edit Payment" : "Add Payment"}
        </Text>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          nestedScrollEnabled={true}
        >
          {/* Payment Type */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Payment Type
            </Text>
            <View style={[styles.typeContainer, { backgroundColor: colors.surfaceSecondary }]}>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  formData.type === "to_pay" && [
                    styles.typeTabActive,
                    { backgroundColor: colors.surface },
                    shadows.sm,
                  ],
                ]}
                onPress={() => setFormData({ ...formData, type: "to_pay" })}
                activeOpacity={0.7}
              >
                <ArrowUpRight
                  size={16}
                  color={formData.type === "to_pay" ? colors.primary : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: colors.textTertiary },
                    formData.type === "to_pay" && { color: colors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  To Pay
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeTab,
                  formData.type === "to_receive" && [
                    styles.typeTabActive,
                    { backgroundColor: colors.surface },
                    shadows.sm,
                  ],
                ]}
                onPress={() => setFormData({ ...formData, type: "to_receive" })}
                activeOpacity={0.7}
              >
                <ArrowDownLeft
                  size={16}
                  color={formData.type === "to_receive" ? colors.primary : colors.textTertiary}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: colors.textTertiary },
                    formData.type === "to_receive" && { color: colors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  To Receive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Payment Details
            </Text>

            {/* Person Name Field with Dropdown */}
            <View style={styles.personNameContainer}>
              <View
                style={[styles.inputContainer, { backgroundColor: colors.surface }]}
              >
                <User size={20} color={colors.textTertiary} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary }]}
                  placeholder={
                    formData.type === "to_pay"
                      ? "Who to pay?"
                      : "Who to receive from?"
                  }
                  placeholderTextColor={colors.textTertiary}
                  value={formData.personName}
                  onChangeText={(text) => {
                    setFormData({ ...formData, personName: text });
                    setSearchText(text);
                  }}
                  autoCapitalize="words"
                />
                {previousUsers.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      setIsDropdownOpen(true);
                    }}
                    style={styles.dropdownToggle}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel="Choose from previous contacts"
                  >
                    <ChevronDown size={20} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Dropdown Modal - shadcn/ui style */}
              <Modal
                visible={isDropdownOpen && previousUsers.length > 0}
                transparent
                animationType="fade"
                onRequestClose={() => setIsDropdownOpen(false)}
              >
                <Pressable style={styles.dropdownOverlay} onPress={() => setIsDropdownOpen(false)}>
                    <Pressable
                      onPress={(event) => event.stopPropagation()}
                        style={[
                          styles.dropdownModal,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                          shadows.lg,
                        ]}
                    >
                        {/* Search Input */}
                        <View style={[styles.dropdownSearchContainer, { borderBottomColor: colors.borderLight }]}>
                          <User size={16} color={colors.textTertiary} />
                          <TextInput
                            style={[styles.dropdownSearchInput, { color: colors.textPrimary }]}
                            placeholder="Search contacts..."
                            placeholderTextColor={colors.textTertiary}
                            value={searchText}
                            onChangeText={setSearchText}
                          />
                        </View>

                        {/* Options List */}
                        <FlatList
                          data={filteredOptions}
                          keyExtractor={(item) => item}
                          style={styles.dropdownList}
                          showsVerticalScrollIndicator={true}
                          bounces={true}
                          keyboardShouldPersistTaps="handled"
                          renderItem={({ item }) => {
                            const isSelected = formData.personName === item;
                            return (
                              <Pressable
                                style={({ pressed }) => [
                                  styles.dropdownOption,
                                  { backgroundColor: pressed ? colors.surfaceSecondary : 'transparent' },
                                  isSelected && { backgroundColor: colors.primaryLight },
                                ]}
                                onPress={() => handlePersonNameSelect(item)}
                              >
                                <View style={[styles.optionAvatar, { backgroundColor: isSelected ? colors.primary : colors.surfaceSecondary }]}>
                                  <Text style={[styles.optionAvatarText, { color: isSelected ? colors.white : colors.textSecondary }]}>
                                    {item.charAt(0).toUpperCase()}
                                  </Text>
                                </View>
                                <Text
                                  style={[
                                    styles.dropdownOptionText,
                                    { color: isSelected ? colors.primary : colors.textPrimary },
                                    isSelected && { fontWeight: '600' },
                                  ]}
                                >
                                  {item}
                                </Text>
                                {isSelected && (
                                  <Check size={16} color={colors.primary} />
                                )}
                              </Pressable>
                            );
                          }}
                          ListEmptyComponent={
                            <View style={styles.emptyState}>
                              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                                No contacts found
                              </Text>
                            </View>
                          }
                        />
                    </Pressable>
                </Pressable>
              </Modal>
            </View>

            {/* Amount */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <DollarSign size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Amount"
                placeholderTextColor={colors.textTertiary}
                value={amountText}
                onChangeText={(text) => {
                  const normalized = text.replace(",", ".").replace(/[^0-9.]/g, "");
                  const [whole, ...rest] = normalized.split(".");
                  setAmountText(
                    rest.length > 0 ? `${whole}.${rest.join("")}` : whole
                  );
                }}
                keyboardType="decimal-pad"
                accessibilityLabel="Payment amount"
              />
            </View>

            {/* Quick Amount Selection */}
            <View style={styles.quickAmountContainer}>
              <View style={styles.quickAmountHeader}>
                <Text style={[styles.quickAmountLabel, { color: colors.textTertiary }]}>
                  Quick add:
                </Text>
                {!!amountText && (
                  <TouchableOpacity
                    onPress={() => setAmountText("")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel="Clear amount"
                  >
                    <Text style={[styles.quickAmountClear, { color: colors.primary }]}>
                      Clear
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickAmountScroll}
                keyboardShouldPersistTaps="handled"
              >
                {[50, 100, 200, 500, 1000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.quickAmountBadge,
                      { backgroundColor: colors.surfaceSecondary },
                    ]}
                    onPress={() => addQuickAmount(amount)}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${amount} to amount`}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        numericTextStyle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      +{amount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <FileText size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Description (optional)"
                placeholderTextColor={colors.textTertiary}
                value={formData.description || ""}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                onFocus={() => {
                  setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 250);
                }}
              />
            </View>

            {/* Due Date */}
            <TouchableOpacity
              style={[styles.inputContainer, { backgroundColor: colors.surface }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={colors.textTertiary} />
              <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                {formatDate(formData.dueDate)}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={styles.footer}>
          <Button
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={submitting}
            disabled={isSubmitDisabled}
          >
            {editingPayment ? "Update Payment" : "Add Payment"}
          </Button>
        </View>

        {/* Date Picker - Platform specific rendering */}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={formData.dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (event.type === "set" && selectedDate) {
                setFormData({ ...formData, dueDate: selectedDate });
              }
            }}
          />
        )}

        {/* iOS Date Picker Modal with proper theming */}
        {Platform.OS === "ios" && (
          <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <Pressable style={styles.datePickerOverlay} onPress={() => setShowDatePicker(false)}>
                <Pressable
                  onPress={(event) => event.stopPropagation()}
                  style={[styles.datePickerModal, { backgroundColor: colors.surface }]}
                >
                    <View style={[styles.datePickerHeader, { borderBottomColor: colors.borderLight }]}>
                      <Text style={[styles.datePickerTitle, { color: colors.textPrimary }]}>
                        Select Date
                      </Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.datePickerDone, { color: colors.primary }]}>
                          Done
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={formData.dueDate}
                      mode="date"
                      display="spinner"
                      themeVariant={theme}
                      onChange={(_event, selectedDate) => {
                        if (selectedDate) {
                          setFormData({ ...formData, dueDate: selectedDate });
                        }
                      }}
                      style={styles.iosDatePicker}
                    />
                </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </Drawer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  typeContainer: {
    flexDirection: "row",
    borderRadius: radius.md,
    padding: spacing.xs,
  },
  typeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    gap: spacing.xs,
    minHeight: 44,
  },
  typeTabActive: {},
  typeTabText: {
    ...typography.bodyMedium,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
    minHeight: 52,
  },
  input: {
    flex: 1,
    ...typography.body,
    minHeight: 24,
  },
  dateText: {
    flex: 1,
    ...typography.body,
  },
  personNameContainer: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownToggle: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  // Dropdown Modal Styles (shadcn/ui inspired)
  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  dropdownModal: {
    width: "100%",
    maxWidth: 340,
    maxHeight: 400,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  dropdownSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  dropdownSearchInput: {
    flex: 1,
    ...typography.body,
    padding: 0,
  },
  dropdownList: {
    maxHeight: 320,
  },
  dropdownOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52,
    gap: spacing.md,
  },
  dropdownOptionText: {
    ...typography.body,
    flex: 1,
  },
  optionAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  optionAvatarText: {
    ...typography.captionMedium,
  },
  emptyState: {
    padding: spacing.xxl,
    alignItems: "center",
  },
  emptyText: {
    ...typography.body,
  },
  // Date Picker Modal Styles
  datePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  datePickerModal: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl,
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  datePickerTitle: {
    ...typography.bodySemibold,
  },
  datePickerDone: {
    ...typography.bodySemibold,
  },
  iosDatePicker: {
    height: 200,
  },
  quickAmountContainer: {
    marginBottom: spacing.md,
  },
  quickAmountHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  quickAmountLabel: {
    ...typography.caption,
  },
  quickAmountClear: {
    ...typography.captionMedium,
  },
  quickAmountScroll: {
    gap: spacing.sm,
  },
  quickAmountBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    minHeight: 44,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAmountText: {
    ...typography.captionMedium,
    ...numericTextStyle,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});

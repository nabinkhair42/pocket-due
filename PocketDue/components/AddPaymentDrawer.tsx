import DateTimePicker from "@react-native-community/datetimepicker";
import { Calendar, DollarSign, FileText, User, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";
import { CreatePaymentRequest } from "../types/api";
import { Payment } from "../types/models";
import { Button } from "./Button";

interface AddPaymentDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest) => void;
  editingPayment?: Payment | null;
}

export const AddPaymentDrawer: React.FC<AddPaymentDrawerProps> = ({
  visible,
  onClose,
  onSubmit,
  editingPayment,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    type: "to_pay",
    personName: "",
    amount: 0,
    dueDate: new Date(),
    description: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (editingPayment) {
      setFormData({
        type: editingPayment.type,
        personName: editingPayment.personName,
        amount: editingPayment.amount,
        dueDate: new Date(editingPayment.dueDate),
        description: editingPayment.description || "",
      });
    } else {
      setFormData({
        type: "to_pay",
        personName: "",
        amount: 0,
        dueDate: new Date(),
        description: "",
      });
    }
  }, [editingPayment, visible]);

  const handleSubmit = () => {
    if (!formData.personName.trim()) {
      return;
    }
    onSubmit(formData);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderInputField = (
    icon: React.ReactNode,
    placeholder: string,
    value: string | number,
    onChangeText: (text: string) => void,
    keyboardType: "default" | "numeric" = "default",
    multiline: boolean = false
  ) => (
    <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        style={[styles.input, { color: colors.textPrimary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        value={value.toString()}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {editingPayment ? "Edit Payment" : "Add Payment"}
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Payment Type
            </Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      formData.type === "to_pay"
                        ? colors.primary
                        : colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setFormData({ ...formData, type: "to_pay" })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        formData.type === "to_pay"
                          ? colors.surface
                          : colors.textSecondary,
                    },
                  ]}
                >
                  To Pay
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      formData.type === "to_receive"
                        ? colors.primary
                        : colors.surfaceSecondary,
                  },
                ]}
                onPress={() => setFormData({ ...formData, type: "to_receive" })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        formData.type === "to_receive"
                          ? colors.surface
                          : colors.textSecondary,
                    },
                  ]}
                >
                  To Receive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Payment Details
            </Text>
            {renderInputField(
              <User size={20} color={colors.textSecondary} />,
              formData.type === "to_pay"
                ? "Who to pay?"
                : "Who to receive from?",
              formData.personName,
              (text) => setFormData({ ...formData, personName: text })
            )}
            {renderInputField(
              <DollarSign size={20} color={colors.textSecondary} />,
              "Amount",
              formData.amount,
              (text) =>
                setFormData({ ...formData, amount: parseFloat(text) || 0 }),
              "numeric"
            )}
            <TouchableOpacity
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.inputIcon}>
                <Calendar size={20} color={colors.textSecondary} />
              </View>
              <Text style={[styles.dateText, { color: colors.textPrimary }]}>
                {formatDate(formData.dueDate)}
              </Text>
            </TouchableOpacity>
            {renderInputField(
              <FileText size={20} color={colors.textSecondary} />,
              "Description (optional)",
              formData.description || "",
              (text) => setFormData({ ...formData, description: text }),
              "default",
              true
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            style={styles.submitButton}
          >
            <Text style={[styles.submitText, { color: colors.surface }]}>
              {editingPayment ? "Update Payment" : "Add Payment"}
            </Text>
          </Button>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setFormData({ ...formData, dueDate: selectedDate });
              }
            }}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  submitButton: {
    width: "100%",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

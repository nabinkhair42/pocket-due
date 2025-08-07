import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Edit, Trash2, Check, Clock } from "lucide-react-native";
import { Payment } from "../types/models";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";

interface PaymentCardProps {
  payment: Payment;
  onEdit: (payment: Payment) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  payment,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  // Safety check for undefined payment
  if (!payment || !payment._id) {
    console.error("PaymentCard received invalid payment:", payment);
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getStatusInfo = () => {
    if (payment.type === "to_pay") {
      return {
        paid: {
          text: "Paid",
          gradient: colors.gradientSuccess,
          icon: <Check size={16} color={colors.surface} />,
        },
        unpaid: {
          text: "Unpaid",
          gradient: colors.gradientError,
          icon: <Clock size={16} color={colors.surface} />,
        },
      };
    } else {
      return {
        received: {
          text: "Received",
          gradient: colors.gradientSuccess,
          icon: <Check size={16} color={colors.surface} />,
        },
        pending: {
          text: "Pending",
          gradient: colors.gradientError,
          icon: <Clock size={16} color={colors.surface} />,
        },
      };
    }
  };

  const statusInfo = getStatusInfo();
  const currentStatus =
    statusInfo[payment.status as keyof typeof statusInfo] ||
    statusInfo.unpaid ||
    statusInfo.pending;

  const handleDelete = () => {
    Alert.alert(
      "Delete Payment",
      "Are you sure you want to delete this payment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(payment._id),
        },
      ]
    );
  };

  const handleStatusToggle = () => {
    const action =
      payment.type === "to_pay"
        ? payment.status === "paid"
          ? "mark as unpaid"
          : "mark as paid"
        : payment.status === "received"
        ? "mark as pending"
        : "mark as received";

    Alert.alert("Update Status", `Do you want to ${action} this payment?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Update",
        onPress: () => onToggleStatus(payment._id),
      },
    ]);
  };

  const isOverdue = () => {
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    return (
      dueDate < today &&
      payment.status !== "paid" &&
      payment.status !== "received"
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: colors.cardShadow,
          borderLeftWidth: 4,
          borderLeftColor: isOverdue() ? colors.error : "transparent",
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={[styles.personName, { color: colors.textPrimary }]}>
            {payment.personName}
          </Text>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>
            {formatAmount(payment.amount)}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onEdit(payment)}
            style={[
              styles.actionButton,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Edit size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={[
              styles.actionButton,
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Trash2 size={16} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
          Due: {formatDate(payment.dueDate)}
          {isOverdue() && (
            <Text style={[styles.overdueText, { color: colors.error }]}>
              {" "}
              (Overdue)
            </Text>
          )}
        </Text>
        {payment.description && (
          <Text style={[styles.description, { color: colors.textTertiary }]}>
            {payment.description}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleStatusToggle}
        style={styles.statusContainer}
      >
        <LinearGradient
          colors={
            Array.isArray(currentStatus?.gradient)
              ? (currentStatus.gradient as [string, string])
              : ["#ef4444", "#dc2626"]
          }
          style={styles.statusGradient}
        >
          <View style={styles.statusContent}>
            {currentStatus?.icon}
            <Text style={[styles.statusText, { color: colors.surface }]}>
              {currentStatus?.text || "Unknown"}
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleSection: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    marginBottom: 16,
  },
  dueDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  overdueText: {
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusContainer: {
    alignSelf: "flex-start",
  },
  statusGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
});

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
    return `₨${amount.toFixed(2)}`;
  };

  const getStatusInfo = () => {
    if (payment.type === "to_pay") {
      return {
        paid: {
          text: "Paid",
          gradient: colors.gradientSuccess,
          icon: <Check size={12} color={colors.surface} />,
        },
        unpaid: {
          text: "Unpaid",
          gradient: colors.gradientError,
          icon: <Clock size={12} color={colors.surface} />,
        },
      };
    } else {
      return {
        received: {
          text: "Received",
          gradient: colors.gradientSuccess,
          icon: <Check size={12} color={colors.surface} />,
        },
        pending: {
          text: "Pending",
          gradient: colors.gradientError,
          icon: <Clock size={12} color={colors.surface} />,
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

  const getBorderColor = () => {
    if (payment.status === "paid" || payment.status === "received") {
      return colors.success;
    } else if (isOverdue()) {
      return colors.error;
    } else {
      return colors.warning;
    }
  };

  const getStatusColor = () => {
    if (payment.status === "paid" || payment.status === "received") {
      return colors.success;
    } else if (isOverdue()) {
      return colors.error;
    } else {
      return colors.warning;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.cardBackground,
          shadowColor: colors.cardShadow,
          borderWidth: 1,
          borderColor: getBorderColor(),
        },
      ]}
      onPress={handleStatusToggle}
      activeOpacity={0.7}
    >
      <View style={styles.mainContent}>
        <View style={styles.leftSection}>
          <Text style={[styles.personName, { color: colors.textPrimary }]}>
            {payment.personName}
          </Text>
          <Text style={[styles.dueDate, { color: colors.textSecondary }]}>
            {formatDate(payment.dueDate)}
            {isOverdue() && (
              <Text style={[styles.overdueText, { color: colors.error }]}>
                {" "}
                • Overdue
              </Text>
            )}
          </Text>
        </View>

        <View style={styles.rightSection}>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>
            {formatAmount(payment.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(),
              },
            ]}
          >
            {currentStatus?.icon}
            <Text style={[styles.statusText, { color: colors.surface }]}>
              {currentStatus?.text || "Unknown"}
            </Text>
          </View>
        </View>
      </View>

      {payment.description && (
        <Text style={[styles.description, { color: colors.textTertiary }]}>
          {payment.description}
        </Text>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => onEdit(payment)}
          style={styles.actionButton}
        >
          <Edit size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
          <Trash2 size={14} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
  },
  mainContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  leftSection: {
    flex: 1,
    marginRight: 12,
  },
  rightSection: {
    alignItems: "flex-end",
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 13,
  },
  overdueText: {
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
});

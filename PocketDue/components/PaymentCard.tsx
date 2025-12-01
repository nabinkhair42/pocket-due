import { Check, Clock, Edit2, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors, spacing, radius, typography, shadows } from "../lib/theme";
import { Payment } from "../types/models";
import { Button } from "./Button";
import { Drawer } from "./Drawer";

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
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  const [showDeleteDrawer, setShowDeleteDrawer] = useState(false);

  if (!payment || !payment._id) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  const isOverdue = () => {
    const dueDate = new Date(payment.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      dueDate < today &&
      payment.status !== "paid" &&
      payment.status !== "received"
    );
  };

  const isCompleted = payment.status === "paid" || payment.status === "received";

  const getStatusConfig = () => {
    if (isCompleted) {
      return {
        text: payment.status === "paid" ? "Paid" : "Received",
        backgroundColor: colors.successLight,
        textColor: colors.success,
        icon: Check,
      };
    } else if (isOverdue()) {
      return {
        text: "Overdue",
        backgroundColor: colors.errorLight,
        textColor: colors.error,
        icon: Clock,
      };
    } else {
      return {
        text: payment.type === "to_pay" ? "Unpaid" : "Pending",
        backgroundColor: colors.warningLight,
        textColor: colors.warning,
        icon: Clock,
      };
    }
  };

  const getActionText = () => {
    if (payment.type === "to_pay") {
      return payment.status === "paid" ? "Mark as Unpaid" : "Mark as Paid";
    }
    return payment.status === "received" ? "Mark as Pending" : "Mark as Received";
  };

  const isCompletingAction = () => {
    const action = getActionText();
    return action === "Mark as Paid" || action === "Mark as Received";
  };

  const handleStatusConfirm = () => {
    setShowStatusDrawer(false);
    onToggleStatus(payment._id);
  };

  const handleDeleteConfirm = () => {
    setShowDeleteDrawer(false);
    onDelete(payment._id);
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          },
          shadows.sm,
        ]}
        onPress={() => setShowStatusDrawer(true)}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.personInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {payment.personName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.personDetails}>
              <Text style={[styles.personName, { color: colors.textPrimary }]}>
                {payment.personName}
              </Text>
              <Text style={[styles.dueDate, { color: colors.textTertiary }]}>
                Due {formatDate(payment.dueDate)}
              </Text>
            </View>
          </View>
          <View style={styles.amountSection}>
            <Text style={[styles.amount, { color: colors.textPrimary }]}>
              {formatAmount(payment.amount)}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.backgroundColor }]}>
              <StatusIcon size={12} color={statusConfig.textColor} />
              <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
        </View>

        {payment.description && (
          <Text
            style={[styles.description, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {payment.description}
          </Text>
        )}

        <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
          <TouchableOpacity
            onPress={() => onEdit(payment)}
            style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
            activeOpacity={0.7}
          >
            <Edit2 size={14} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDeleteDrawer(true)}
            style={[styles.actionButton, { backgroundColor: colors.errorLight }]}
            activeOpacity={0.7}
          >
            <Trash2 size={14} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Status Update Drawer */}
      <Drawer
        visible={showStatusDrawer}
        onClose={() => setShowStatusDrawer(false)}
        height={340}
      >
        <View style={styles.drawerContent}>
          <Text style={[styles.drawerTitle, { color: colors.textPrimary }]}>
            Update Status
          </Text>

          <View style={[styles.paymentPreview, { backgroundColor: colors.surface }]}>
            <View style={[styles.previewAvatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.previewAvatarText, { color: colors.primary }]}>
                {payment.personName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.previewDetails}>
              <Text style={[styles.previewName, { color: colors.textPrimary }]}>
                {payment.personName}
              </Text>
              <Text style={[styles.previewAmount, { color: colors.textSecondary }]}>
                {formatAmount(payment.amount)}
              </Text>
            </View>
          </View>

          <Text style={[styles.drawerMessage, { color: colors.textSecondary }]}>
            {isCompletingAction()
              ? "This payment will be marked as complete and removed from your list."
              : "This will update the payment status."}
          </Text>

          <Button
            onPress={handleStatusConfirm}
            variant="primary"
            size="lg"
            fullWidth
            icon={<Check size={18} color={colors.white} />}
          >
            {isCompletingAction()
              ? (payment.type === "to_pay" ? "Paid" : "Received")
              : "Update Status"}
          </Button>
        </View>
      </Drawer>

      {/* Delete Confirmation Drawer */}
      <Drawer
        visible={showDeleteDrawer}
        onClose={() => setShowDeleteDrawer(false)}
        height={400}
      >
        <View style={styles.drawerContent}>
          <View style={[styles.deleteIconContainer, { backgroundColor: colors.errorLight }]}>
            <Trash2 size={32} color={colors.error} />
          </View>

          <Text style={[styles.drawerTitle, { color: colors.textPrimary, textAlign: "center" }]}>
            Delete Payment
          </Text>

          <Text style={[styles.drawerMessage, { color: colors.textSecondary, textAlign: "center" }]}>
            Are you sure you want to delete this payment? This action cannot be undone.
          </Text>

          <View style={[styles.paymentPreview, { backgroundColor: colors.surface }]}>
            <View style={[styles.previewAvatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.previewAvatarText, { color: colors.primary }]}>
                {payment.personName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.previewDetails}>
              <Text style={[styles.previewName, { color: colors.textPrimary }]}>
                {payment.personName}
              </Text>
              <Text style={[styles.previewAmount, { color: colors.textSecondary }]}>
                {formatAmount(payment.amount)}
              </Text>
            </View>
          </View>

          <Button
            onPress={handleDeleteConfirm}
            variant="danger"
            size="lg"
            fullWidth
            icon={<Trash2 size={18} color={colors.white} />}
          >
            Delete Payment
          </Button>
        </View>
      </Drawer>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...typography.bodySemibold,
  },
  personDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  personName: {
    ...typography.bodySemibold,
  },
  dueDate: {
    ...typography.caption,
    marginTop: 2,
  },
  amountSection: {
    alignItems: "flex-end",
  },
  amount: {
    ...typography.h3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  statusText: {
    ...typography.small,
  },
  description: {
    ...typography.caption,
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  actionText: {
    ...typography.small,
  },
  // Drawer content styles
  drawerContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  drawerTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  paymentPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  previewAvatarText: {
    ...typography.h3,
  },
  previewDetails: {
    flex: 1,
  },
  previewName: {
    ...typography.bodySemibold,
  },
  previewAmount: {
    ...typography.body,
    marginTop: 2,
  },
  drawerMessage: {
    ...typography.body,
    marginBottom: spacing.xl,
  },
  deleteIconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
});

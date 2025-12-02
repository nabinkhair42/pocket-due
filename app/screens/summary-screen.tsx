import {
  ChevronLeft,
  BarChart3,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SummaryCardSkeleton } from "../components/summary-card-skeleton";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/toast-context";
import { usePayment } from "../hooks/use-payment";
import { getThemeColors, spacing, radius, typography } from "../lib/theme";
import { PaymentSummary } from "../types/api";

interface SummaryScreenProps {
  onBack: () => void;
}

interface SummaryDetailModalProps {
  visible: boolean;
  summary: PaymentSummary | null;
  onClose: () => void;
}

const SummaryDetailModal: React.FC<SummaryDetailModalProps> = ({
  visible,
  summary,
  onClose,
}) => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme);

  if (!summary) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
      case "received":
        return { color: colors.success, bg: colors.successLight, text: status === "paid" ? "Paid" : "Received" };
      case "unpaid":
      case "pending":
        return { color: colors.warning, bg: colors.warningLight, text: status === "unpaid" ? "Unpaid" : "Pending" };
      default:
        return { color: colors.textSecondary, bg: colors.surfaceSecondary, text: status };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          >
            <ChevronLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {summary.personName}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              Net Balance
            </Text>
            <Text
              style={[
                styles.netTotal,
                { color: summary.netTotal >= 0 ? colors.success : colors.error },
              ]}
            >
              {summary.netTotal >= 0 ? "+" : ""}{formatAmount(summary.netTotal)}
            </Text>
            <View style={styles.summaryBreakdown}>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                  To Receive
                </Text>
                <Text style={[styles.breakdownAmount, { color: colors.success }]}>
                  +{formatAmount(summary.toReceive)}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                  To Pay
                </Text>
                <Text style={[styles.breakdownAmount, { color: colors.error }]}>
                  -{formatAmount(summary.toPay)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.paymentsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              PAYMENT DETAILS
            </Text>
            {summary.payments.map((payment) => {
              const statusConfig = getStatusConfig(payment.status);
              return (
                <View
                  key={payment._id}
                  style={[styles.paymentItem, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.paymentHeader}>
                    <Text
                      style={[
                        styles.paymentType,
                        { color: payment.type === "to_receive" ? colors.success : colors.error },
                      ]}
                    >
                      {payment.type === "to_receive" ? "To Receive" : "To Pay"}
                    </Text>
                    <Text
                      style={[
                        styles.paymentAmount,
                        { color: payment.type === "to_receive" ? colors.success : colors.error },
                      ]}
                    >
                      {payment.type === "to_receive" ? "+" : "-"}{formatAmount(payment.amount)}
                    </Text>
                  </View>
                  {payment.description && (
                    <Text style={[styles.paymentDescription, { color: colors.textSecondary }]}>
                      {payment.description}
                    </Text>
                  )}
                  <View style={styles.paymentFooter}>
                    <Text style={[styles.paymentDate, { color: colors.textTertiary }]}>
                      Due {formatDate(payment.dueDate)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.text}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ onBack }) => {
  const [selectedSummary, setSelectedSummary] = useState<PaymentSummary | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { summaries, summariesLoading, getPaymentSummaries } = usePayment();
  const { showToast } = useToast();

  useEffect(() => {
    loadSummaries();
  }, []);

  const loadSummaries = async () => {
    try {
      await getPaymentSummaries();
    } catch (error) {
      showToast("Failed to load summaries", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSummaries();
  };

  const handleSummaryPress = (summary: PaymentSummary) => {
    setSelectedSummary(summary);
    setModalVisible(true);
  };

  const formatAmount = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  const renderSummaryCard = ({ item }: { item: PaymentSummary }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => handleSummaryPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.personInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>
              {item.personName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.personName, { color: colors.textPrimary }]}>
            {item.personName}
          </Text>
        </View>
        <Text
          style={[
            styles.netAmount,
            { color: item.netTotal >= 0 ? colors.success : colors.error },
          ]}
        >
          {item.netTotal >= 0 ? "+" : ""}{formatAmount(item.netTotal)}
        </Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>To Receive</Text>
          <Text style={[styles.detailAmount, { color: colors.success }]}>+{formatAmount(item.toReceive)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>To Pay</Text>
          <Text style={[styles.detailAmount, { color: colors.error }]}>-{formatAmount(item.toPay)}</Text>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
        <Text style={[styles.paymentCount, { color: colors.textTertiary }]}>
          {item.payments.length} payment{item.payments.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryLight }]}>
        <BarChart3 size={32} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No summaries yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Add some payments to see summaries
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: colors.surfaceSecondary }]}
          activeOpacity={0.7}
        >
          <ChevronLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Summaries
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {summariesLoading ? (
          <SummaryCardSkeleton count={4} />
        ) : (
          <FlatList
            data={summaries}
            renderItem={renderSummaryCard}
            keyExtractor={(item) => item.personName}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>

      <SummaryDetailModal
        visible={modalVisible}
        summary={selectedSummary}
        onClose={() => setModalVisible(false)}
      />
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...typography.h2,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  listContainer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    ...typography.bodySemibold,
  },
  personName: {
    ...typography.bodySemibold,
  },
  netAmount: {
    ...typography.h3,
  },
  cardDetails: {
    gap: spacing.xs,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    ...typography.caption,
  },
  detailAmount: {
    ...typography.captionMedium,
  },
  cardFooter: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.md,
  },
  paymentCount: {
    ...typography.caption,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    textAlign: "center",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  modalTitle: {
    ...typography.h2,
  },
  modalContent: {
    flex: 1,
    padding: spacing.xl,
  },
  summaryCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  summaryLabel: {
    ...typography.captionMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  netTotal: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  summaryBreakdown: {
    gap: spacing.sm,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownLabel: {
    ...typography.body,
  },
  breakdownAmount: {
    ...typography.bodySemibold,
  },
  paymentsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.captionMedium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  paymentItem: {
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  paymentType: {
    ...typography.captionMedium,
  },
  paymentAmount: {
    ...typography.bodySemibold,
  },
  paymentDescription: {
    ...typography.caption,
    marginBottom: spacing.sm,
  },
  paymentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentDate: {
    ...typography.caption,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    ...typography.small,
  },
});

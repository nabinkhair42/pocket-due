import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CardSim,
  SheetIcon,
} from "lucide-react-native";
import { usePayment } from "../hooks/usePayment";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";
import { PaymentSummary } from "../types/api";
import { useToast } from "../contexts/ToastContext";

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
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return `₨ ${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "received":
        return colors.success;
      case "unpaid":
      case "pending":
        return colors.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "received":
        return "Received";
      case "unpaid":
        return "Unpaid";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { backgroundColor: colors.background }]}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {summary.personName}
          </Text>
        </View>

        <ScrollView
          style={styles.modalContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary Card */}
          <View
            style={[
              styles.modalSummaryCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>
              Net Balance
            </Text>
            <Text
              style={[
                styles.netTotal,
                {
                  color: summary.netTotal >= 0 ? colors.success : colors.error,
                },
              ]}
            >
              {summary.netTotal >= 0 ? "+" : ""}
              {formatAmount(summary.netTotal)}
            </Text>
            <View style={styles.summaryBreakdown}>
              <View style={styles.breakdownItem}>
                <Text
                  style={[
                    styles.breakdownLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  To Receive
                </Text>
                <Text
                  style={[styles.breakdownAmount, { color: colors.success }]}
                >
                  +{formatAmount(summary.toReceive)}
                </Text>
              </View>
              <View style={styles.breakdownItem}>
                <Text
                  style={[
                    styles.breakdownLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  To Pay
                </Text>
                <Text style={[styles.breakdownAmount, { color: colors.error }]}>
                  -{formatAmount(summary.toPay)}
                </Text>
              </View>
            </View>
          </View>

          {/* Calculation Display */}
          <View
            style={[
              styles.calculationCard,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={[styles.calculationTitle, { color: colors.textPrimary }]}
            >
              Calculation
            </Text>
            <View style={styles.calculationRow}>
              <Text
                style={[
                  styles.calculationText,
                  { color: colors.textSecondary },
                ]}
              >
                {formatAmount(summary.toReceive)} -{" "}
                {formatAmount(summary.toPay)} ={" "}
              </Text>
              <Text
                style={[
                  styles.calculationResult,
                  {
                    color:
                      summary.netTotal >= 0 ? colors.success : colors.error,
                  },
                ]}
              >
                {summary.netTotal >= 0 ? "+" : ""}
                {formatAmount(summary.netTotal)}
              </Text>
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.paymentsSection}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Payment Details
            </Text>
            {summary.payments.map((payment, index) => (
              <View
                key={payment._id}
                style={[
                  styles.paymentItem,
                  { backgroundColor: colors.surface },
                  index === summary.payments.length - 1 && { marginBottom: 0 },
                ]}
              >
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentTypeContainer}>
                    {payment.type === "to_receive" ? (
                      <TrendingUp size={16} color={colors.success} />
                    ) : (
                      <TrendingDown size={16} color={colors.error} />
                    )}
                    <Text
                      style={[
                        styles.paymentType,
                        {
                          color:
                            payment.type === "to_receive"
                              ? colors.success
                              : colors.error,
                        },
                      ]}
                    >
                      {payment.type === "to_receive" ? "To Receive" : "To Pay"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.paymentAmount,
                      {
                        color:
                          payment.type === "to_receive"
                            ? colors.success
                            : colors.error,
                      },
                    ]}
                  >
                    {payment.type === "to_receive" ? "+" : "-"}
                    {formatAmount(payment.amount)}
                  </Text>
                </View>
                {payment.description && (
                  <Text
                    style={[
                      styles.paymentDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {payment.description}
                  </Text>
                )}
                <View style={styles.paymentFooter}>
                  <Text
                    style={[styles.paymentDate, { color: colors.textTertiary }]}
                  >
                    Due: {formatDate(payment.dueDate)}
                  </Text>
                  <Text
                    style={[
                      styles.paymentStatus,
                      { color: getStatusColor(payment.status) },
                    ]}
                  >
                    {getStatusText(payment.status)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

export const SummaryScreen: React.FC<SummaryScreenProps> = ({ onBack }) => {
  const [selectedSummary, setSelectedSummary] = useState<PaymentSummary | null>(
    null
  );
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
    return `₨ ${amount.toLocaleString()}`;
  };

  const renderSummaryCard = ({ item }: { item: PaymentSummary }) => (
    <TouchableOpacity
      style={[styles.summaryCard, { backgroundColor: colors.surface }]}
      onPress={() => handleSummaryPress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.personInfo}>
          <User size={20} color={colors.textSecondary} />
          <Text style={[styles.personName, { color: colors.textPrimary }]}>
            {item.personName}
          </Text>
        </View>
        <Text
          style={[
            styles.netAmount,
            {
              color: item.netTotal >= 0 ? colors.success : colors.error,
            },
          ]}
        >
          {formatAmount(item.netTotal)}
        </Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            To Receive
          </Text>
          <Text style={[styles.detailAmount, { color: colors.success }]}>
            +{formatAmount(item.toReceive)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
            To Pay
          </Text>
          <Text style={[styles.detailAmount, { color: colors.error }]}>
            -{formatAmount(item.toPay)}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.paymentCount, { color: colors.textTertiary }]}>
          {item.payments.length} payment{item.payments.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <SheetIcon size={48} color={colors.textTertiary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No payment summaries
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
        Add some payments to see summaries
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradientPrimary as [string, string]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft size={24} color={colors.surface} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.surface }]}>
            Payment Summaries
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {summariesLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading summaries...
            </Text>
          </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  listContainer: {
    paddingVertical: 20,
  },
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  personInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  netAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 8,
  },
  paymentCount: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSummaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  netTotal: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryBreakdown: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breakdownLabel: {
    fontSize: 14,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  calculationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  calculationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  calculationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  calculationText: {
    fontSize: 16,
  },
  calculationResult: {
    fontSize: 18,
    fontWeight: "bold",
  },
  paymentsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  paymentItem: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  paymentTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentType: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  paymentDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  paymentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentStatus: {
    fontSize: 12,
    fontWeight: "600",
  },
});

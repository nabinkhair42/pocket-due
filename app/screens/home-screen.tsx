import { Plus, Settings, BarChart3, WalletCards, WifiOff } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AddPaymentDrawer } from "../components/add-payment-drawer";
import { PaymentCard } from "../components/payment-card";
import { PaymentCardSkeleton } from "../components/payment-card-skeleton";
import { Tabs } from "../components/tabs";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/toast-context";
import { useAuth } from "../hooks/use-auth";
import { usePayment } from "../hooks/use-payment";
import { apiService } from "../lib/api";
import { getThemeColors, spacing, radius, typography, shadows } from "../lib/theme";
import { CreatePaymentRequest } from "../types/api";
import { Payment } from "../types/models";
import { SettingsScreen } from "./settings-screen";
import { SummaryScreen } from "./summary-screen";

export const HomeScreen: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<"to_pay" | "to_receive">("to_pay");
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { showToast } = useToast();
  const { status: authStatus } = useAuth();
  const {
    loading,
    error,
    getPayments,
    createPayment,
    updatePayment,
    togglePaymentStatus,
    deletePayment,
    getPaymentsByType,
  } = usePayment();

  const filteredPayments = getPaymentsByType(currentTab);

  useEffect(() => {
    loadPayments();
    preloadPreviousUsers();
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (drawerVisible) {
          handleCloseDrawer();
          return true;
        }
        if (showSettings) {
          setShowSettings(false);
          return true;
        }
        if (showSummary) {
          setShowSummary(false);
          return true;
        }
        return false;
      }
    );
    return () => subscription.remove();
  }, [drawerVisible, showSettings, showSummary]);

  const preloadPreviousUsers = async () => {
    try {
      await apiService.getPreviousUsers();
    } catch (error) {}
  };

  const loadPayments = async () => {
    const result = await getPayments();
    setRefreshing(false);
    if (!result.ok && result.error !== "UNAUTHORIZED") {
      showToast("Failed to load payments", "error");
    }
  };

  const handleAddPayment = async (formData: CreatePaymentRequest) => {
    const result = await createPayment(formData);
    if (result.ok) {
      setDrawerVisible(false);
      showToast("Payment added successfully!", "success");
    } else {
      showToast("Failed to add payment", "error");
    }
  };

  const handleUpdatePayment = async (formData: CreatePaymentRequest) => {
    if (!editingPayment) return;

    const result = await updatePayment(editingPayment._id, formData);
    if (result.ok) {
      setDrawerVisible(false);
      setEditingPayment(null);
      showToast("Payment updated successfully!", "success");
    } else {
      showToast("Failed to update payment", "error");
    }
  };

  const handleToggleStatus = useCallback(
    async (id: string) => {
      const result = await togglePaymentStatus(id);
      if (!result.ok) {
        showToast("Failed to update status", "error");
        return;
      }
      showToast(
        result.deleted ? "Payment completed and removed" : "Status updated",
        "success"
      );
    },
    [togglePaymentStatus, showToast]
  );

  const handleEditPayment = useCallback((payment: Payment) => {
    setEditingPayment(payment);
    setDrawerVisible(true);
  }, []);

  const handleDeletePayment = useCallback(
    async (id: string) => {
      const result = await deletePayment(id);
      showToast(
        result.ok ? "Payment deleted" : "Failed to delete payment",
        result.ok ? "success" : "error"
      );
    },
    [deletePayment, showToast]
  );

  const handleSubmit = (formData: CreatePaymentRequest) => {
    return editingPayment
      ? handleUpdatePayment(formData)
      : handleAddPayment(formData);
  };

  const handleCloseDrawer = useCallback(() => {
    setDrawerVisible(false);
    setEditingPayment(null);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const renderEmptyState = () => {
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.errorLight }]}>
            <WifiOff size={32} color={colors.error} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Couldn't load your payments
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {error === "TIMEOUT" || error === "NETWORK_ERROR"
              ? "Check your connection and pull down to retry."
              : "Something went wrong. Pull down to retry."}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryLight }]}>
          <WalletCards size={32} color={colors.primary} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
          No payments yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
          {currentTab === "to_pay"
              ? "Add a payment to remember who you need to pay."
              : "Add a payment to remember who needs to pay you."}
        </Text>
      </View>
    );
  };

  const renderPaymentCard = useCallback(
    ({ item }: { item: Payment }) => {
      if (!item || !item._id) return null;
      return (
        <PaymentCard
          payment={item}
          onEdit={handleEditPayment}
          onDelete={handleDeletePayment}
          onToggleStatus={handleToggleStatus}
        />
      );
    },
    [handleEditPayment, handleDeletePayment, handleToggleStatus]
  );

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

  if (showSummary) {
    return <SummaryScreen onBack={() => setShowSummary(false)} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          PocketDue
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowSummary(true)}
            style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="View summaries"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <BarChart3 size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Settings size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {authStatus === "offline" && (
        <View style={[styles.offlineBanner, { backgroundColor: colors.warningLight }]}>
          <WifiOff size={16} color={colors.warning} />
          <Text style={[styles.offlineBannerText, { color: colors.warningDark }]}>
            Offline mode · changes will sync when you’re back online
          </Text>
        </View>
      )}

      <View style={styles.content}>
        <Tabs currentTab={currentTab} onTabChange={setCurrentTab} />

        {loading && !refreshing ? (
          <PaymentCardSkeleton count={4} />
        ) : (
          <FlatList
            data={filteredPayments}
            renderItem={renderPaymentCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            windowSize={11}
            removeClippedSubviews
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.fab }, shadows.lg]}
        onPress={() => setDrawerVisible(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Add payment"
      >
        <Plus size={24} color={colors.fabIcon} />
      </TouchableOpacity>

      <AddPaymentDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        editingPayment={editingPayment}
        defaultType={currentTab}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  title: {
    ...typography.h1,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  offlineBannerText: {
    ...typography.captionMedium,
    flex: 1,
  },
  listContainer: {
    paddingBottom: spacing.xxxl,
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    justifyContent: "center",
    alignItems: "center",
  },
});

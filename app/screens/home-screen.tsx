import { Plus, Settings, BarChart3, WalletCards } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
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

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const [currentTab, setCurrentTab] = useState<"to_pay" | "to_receive">("to_pay");
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { showToast } = useToast();
  const { logout } = useAuth();
  const {
    loading,
    getPayments,
    createPayment,
    updatePayment,
    togglePaymentStatus,
    deletePayment,
    getPaymentsByType,
  } = usePayment();

  const filteredPayments = getPaymentsByType(currentTab) || [];

  useEffect(() => {
    loadPayments();
    preloadPreviousUsers();
  }, []);

  const preloadPreviousUsers = async () => {
    try {
      await apiService.getPreviousUsers();
    } catch (error) {}
  };

  const loadPayments = async () => {
    try {
      await getPayments();
    } catch (error) {
      showToast("Failed to load payments", "error");
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddPayment = async (formData: CreatePaymentRequest) => {
    const payment = await createPayment(formData);
    if (payment) {
      setDrawerVisible(false);
      showToast("Payment added successfully!", "success");
    } else {
      showToast("Failed to add payment", "error");
    }
  };

  const handleUpdatePayment = async (formData: CreatePaymentRequest) => {
    if (!editingPayment) return;

    const payment = await updatePayment(editingPayment._id, formData);
    if (payment) {
      setDrawerVisible(false);
      setEditingPayment(null);
      showToast("Payment updated successfully!", "success");
    } else {
      showToast("Failed to update payment", "error");
    }
  };

  const handleToggleStatus = async (id: string) => {
    const payment = await togglePaymentStatus(id);
    if (payment === null) {
      showToast("Payment completed and removed", "success");
    } else if (!payment) {
      showToast("Failed to update status", "error");
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setDrawerVisible(true);
  };

  const handleDeletePayment = async (id: string) => {
    const success = await deletePayment(id);
    if (success) {
      showToast("Payment deleted", "success");
    } else {
      showToast("Failed to delete payment", "error");
    }
  };

  const handleSubmit = (formData: CreatePaymentRequest) => {
    if (editingPayment) {
      handleUpdatePayment(formData);
    } else {
      handleAddPayment(formData);
    }
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setEditingPayment(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      onLogout();
    } catch (error) {
      onLogout();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primaryLight }]}>
        <WalletCards size={32} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
        No payments yet
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        {currentTab === "to_pay"
          ? "Add payments you need to make"
          : "Add payments you need to receive"}
      </Text>
    </View>
  );

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    if (!item || !item._id) return null;
    return (
      <PaymentCard
        payment={item}
        onEdit={handleEditPayment}
        onDelete={handleDeletePayment}
        onToggleStatus={handleToggleStatus}
      />
    );
  };

  if (showSettings) {
    return (
      <SettingsScreen onLogout={handleLogout} onBack={() => setShowSettings(false)} />
    );
  }

  if (showSummary) {
    return <SummaryScreen onBack={() => setShowSummary(false)} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
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
          >
            <BarChart3 size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={[styles.headerButton, { backgroundColor: colors.surfaceSecondary }]}
            activeOpacity={0.7}
          >
            <Settings size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Tabs currentTab={currentTab} onTabChange={setCurrentTab} />

        {loading ? (
          <PaymentCardSkeleton count={4} />
        ) : (
          <FlatList
            data={Array.isArray(filteredPayments) ? filteredPayments : []}
            renderItem={renderPaymentCard}
            keyExtractor={(item) => item._id}
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.fab }, shadows.lg]}
        onPress={() => setDrawerVisible(true)}
        activeOpacity={0.8}
      >
        <Plus size={24} color={colors.fabIcon} />
      </TouchableOpacity>

      <AddPaymentDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        editingPayment={editingPayment}
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

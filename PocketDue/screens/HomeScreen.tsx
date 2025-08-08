import { LinearGradient } from "expo-linear-gradient";
import { Plus, Settings, SheetIcon, WalletCards } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AddPaymentDrawer } from "../components/AddPaymentDrawer";
import { AppLogo } from "../components/Icons";
import { PaymentCard } from "../components/PaymentCard";
import { Tabs } from "../components/Tabs";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../hooks/useAuth";
import { usePayment } from "../hooks/usePayment";
import { apiService } from "../lib/api";
import { getThemeColors } from "../lib/theme";
import { CreatePaymentRequest } from "../types/api";
import { Payment } from "../types/models";
import { SettingsScreen } from "./SettingsScreen";
import { SummaryScreen } from "./SummaryScreen";

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const [currentTab, setCurrentTab] = useState<"to_pay" | "to_receive">(
    "to_pay"
  );
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { showToast } = useToast();
  const { logout } = useAuth();
  const {
    payments,
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
    // Preload previous users for faster dropdown access
    preloadPreviousUsers();
  }, []);

  const preloadPreviousUsers = async () => {
    try {
      await apiService.getPreviousUsers();
    } catch (error) {}
  };

  const loadPayments = async () => {
    try {
      const paymentsArray = await getPayments();

      setIsAuthenticated(true);
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
      // Payment was deleted after being marked as paid/received
      showToast("Payment completed and removed from list", "success");
    } else if (!payment) {
      showToast("Failed to toggle payment status", "error");
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setDrawerVisible(true);
  };

  const handleDeletePayment = async (id: string) => {
    const success = await deletePayment(id);
    if (success) {
      showToast("Payment deleted successfully!", "success");
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
      <WalletCards size={48} color={colors.textSecondary} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No{" "}
        {currentTab === "to_pay" ? "payments to make" : "payments to receive"}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
        Tap the + button to add your first payment
      </Text>
    </View>
  );

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    if (!item || !item._id) {
      return null;
    }

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
      <SettingsScreen
        onLogout={handleLogout}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  if (showSummary) {
    return <SummaryScreen onBack={() => setShowSummary(false)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradientPrimary as [string, string]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppLogo size={32} />
            <Text style={[styles.title, { color: colors.surface }]}>
              PocketDue
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              onPress={() => setShowSummary(true)}
              style={styles.settingsButton}
            >
              <SheetIcon size={24} color={colors.surface} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowSettings(true)}
              style={styles.settingsButton}
            >
              <Settings size={24} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Tabs currentTab={currentTab} onTabChange={setCurrentTab} />

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading payments...
            </Text>
          </View>
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
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setDrawerVisible(true)}
      >
        <Plus size={24} color={colors.surface} />
      </TouchableOpacity>

      <AddPaymentDrawer
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        editingPayment={editingPayment}
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  settingsButton: {
    padding: 8,
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
   emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});

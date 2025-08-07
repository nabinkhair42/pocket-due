import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Settings, Plus } from "lucide-react-native";
import { apiService, Payment, CreatePaymentRequest } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeColors } from "../lib/theme";
import { PaymentCard } from "../components/PaymentCard";
import { Tabs } from "../components/Tabs";
import { AddPaymentDrawer } from "../components/AddPaymentDrawer";
import { SettingsScreen } from "./SettingsScreen";
import { Button } from "../components/Button";
import { useToast } from "../contexts/ToastContext";

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
  const [currentTab, setCurrentTab] = useState<"to_pay" | "to_receive">(
    "to_pay"
  );
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { theme } = useTheme();
  const colors = getThemeColors(theme);
  const { showToast } = useToast();

  const filteredPayments = payments.filter(
    (payment) => payment.type === currentTab
  );

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const result = await apiService.getPayments();

      if (result.success && result.data?.payments) {
        setPayments(result.data.payments);
      } else {
        console.error("Error loading payments:", result.error);
        showToast("Failed to load payments", "error");
        setPayments([]); // Set empty array as fallback
      }
    } catch (error) {
      console.error("Error loading payments:", error);
      showToast("Failed to load payments", "error");
      setPayments([]); // Set empty array as fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddPayment = async (formData: CreatePaymentRequest) => {
    try {
      const result = await apiService.createPayment(formData);

      if (result.success && result.data?.payment) {
        setPayments((prev) => [result.data!.payment, ...prev]);
        setDrawerVisible(false);
        showToast("Payment added successfully!", "success");
      } else {
        showToast(result.error || "Failed to add payment", "error");
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      showToast("Failed to add payment", "error");
    }
  };

  const handleUpdatePayment = async (formData: CreatePaymentRequest) => {
    if (!editingPayment) return;

    try {
      const result = await apiService.updatePayment(
        editingPayment._id,
        formData
      );

      if (result.success && result.data?.payment) {
        setPayments((prev) =>
          prev.map((payment) =>
            payment._id === editingPayment._id ? result.data!.payment : payment
          )
        );
        setDrawerVisible(false);
        setEditingPayment(null);
        showToast("Payment updated successfully!", "success");
      } else {
        showToast(result.error || "Failed to update payment", "error");
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      showToast("Failed to update payment", "error");
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await apiService.togglePaymentStatus(id);

      if (result.success && result.data?.payment) {
        setPayments((prev) =>
          prev.map((payment) =>
            payment._id === id ? result.data!.payment : payment
          )
        );
      } else {
        showToast(result.error || "Failed to toggle payment status", "error");
      }
    } catch (error) {
      console.error("Error toggling payment status:", error);
      showToast("Failed to toggle payment status", "error");
    }
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setDrawerVisible(true);
  };

  const handleDeletePayment = async (id: string) => {
    try {
      const result = await apiService.deletePayment(id);

      if (result.success) {
        setPayments((prev) => prev.filter((payment) => payment._id !== id));
        showToast("Payment deleted successfully!", "success");
      } else {
        showToast(result.error || "Failed to delete payment", "error");
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
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
      await apiService.logout();
      onLogout();
    } catch (error) {
      console.error("Error logging out:", error);
      onLogout();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPayments();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No{" "}
        {currentTab === "to_pay" ? "payments to make" : "payments to receive"}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
        Tap the + button to add your first payment
      </Text>
    </View>
  );

  const renderPaymentCard = ({ item }: { item: Payment }) => (
    <PaymentCard
      payment={item}
      onEdit={handleEditPayment}
      onDelete={handleDeletePayment}
      onToggleStatus={handleToggleStatus}
    />
  );

  if (showSettings) {
    return (
      <SettingsScreen
        onLogout={handleLogout}
        onBack={() => setShowSettings(false)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.gradientPrimary as [string, string]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: colors.surface }]}>
            PocketDue
          </Text>
          <TouchableOpacity
            onPress={() => setShowSettings(true)}
            style={styles.settingsButton}
          >
            <Settings size={24} color={colors.surface} />
          </TouchableOpacity>
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
            data={filteredPayments || []}
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

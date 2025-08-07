import { useState, useCallback } from "react";
import { apiService } from "../lib/api";
import { Payment } from "../types/models";
import { CreatePaymentRequest, UpdatePaymentRequest } from "../types/api";

export const usePayment = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const getPayments = useCallback(async (): Promise<Payment[]> => {
    setLoading(true);
    try {
      const result = await apiService.getPayments();
      if (result.success && result.data?.payments) {
        const paymentsArray = Array.isArray(result.data.payments)
          ? result.data.payments
          : [];
        setPayments(paymentsArray);
        return paymentsArray;
      }
      return [];
    } catch (error) {
      console.error("Error loading payments:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(
    async (data: CreatePaymentRequest): Promise<Payment | null> => {
      try {
        const result = await apiService.createPayment(data);
        if (result.success && result.data?.payment) {
          setPayments((prev) => [
            result.data!.payment,
            ...(Array.isArray(prev) ? prev : []),
          ]);
          return result.data.payment;
        }
        return null;
      } catch (error) {
        console.error("Error creating payment:", error);
        return null;
      }
    },
    []
  );

  const updatePayment = useCallback(
    async (id: string, data: UpdatePaymentRequest): Promise<Payment | null> => {
      try {
        const result = await apiService.updatePayment(id, data);
        if (result.success && result.data?.payment) {
          setPayments((prev) =>
            Array.isArray(prev)
              ? prev.map((payment) =>
                  payment._id === id ? result.data!.payment : payment
                )
              : []
          );
          return result.data.payment;
        }
        return null;
      } catch (error) {
        console.error("Error updating payment:", error);
        return null;
      }
    },
    []
  );

  const togglePaymentStatus = useCallback(
    async (id: string): Promise<Payment | null> => {
      try {
        const result = await apiService.togglePaymentStatus(id);
        if (result.success && result.data?.payment) {
          setPayments((prev) =>
            Array.isArray(prev)
              ? prev.map((payment) =>
                  payment._id === id ? result.data!.payment : payment
                )
              : []
          );
          return result.data.payment;
        }
        return null;
      } catch (error) {
        console.error("Error toggling payment status:", error);
        return null;
      }
    },
    []
  );

  const deletePayment = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await apiService.deletePayment(id);
      if (result.success) {
        setPayments((prev) =>
          Array.isArray(prev)
            ? prev.filter((payment) => payment._id !== id)
            : []
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting payment:", error);
      return false;
    }
  }, []);

  const getPaymentsByType = useCallback(
    (type: "to_pay" | "to_receive"): Payment[] => {
      if (!Array.isArray(payments)) {
        console.warn("Payments is not an array:", payments);
        return [];
      }
      return payments.filter((payment) => payment.type === type);
    },
    [payments]
  );

  return {
    payments,
    loading,
    getPayments,
    createPayment,
    updatePayment,
    togglePaymentStatus,
    deletePayment,
    getPaymentsByType,
  };
};

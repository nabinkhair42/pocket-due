import { useCallback, useMemo, useState } from "react";
import { apiService } from "../lib/api";
import {
  CreatePaymentRequest,
  PaymentSummary,
  UpdatePaymentRequest,
} from "../types/api";
import { Payment } from "../types/models";

/**
 * Toggling can legitimately delete the payment (when it's marked complete), so
 * "no payment came back" is ambiguous unless success is reported separately.
 * Previously this returned `Payment | null` for both outcomes, which made the
 * caller's failure branch unreachable and showed a success toast on failure.
 */
export type ToggleResult =
  | { ok: true; deleted: true }
  | { ok: true; deleted: false; payment: Payment }
  | { ok: false; error?: string };

export type MutationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error?: string };

export const usePayment = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  /** Non-null when the last load failed, so the UI can tell "empty" from "broken". */
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<PaymentSummary[]>([]);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [summariesError, setSummariesError] = useState<string | null>(null);

  const getPayments = useCallback(async (): Promise<
    MutationResult<Payment[]>
  > => {
    setLoading(true);
    try {
      const result = await apiService.getPayments();
      if (result.success && result.data?.payments) {
        const paymentsArray = Array.isArray(result.data.payments)
          ? result.data.payments
          : [];
        setPayments(paymentsArray);
        setError(null);
        return { ok: true, data: paymentsArray };
      }
      setError(result.error || "REQUEST_FAILED");
      return { ok: false, error: result.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(
    async (data: CreatePaymentRequest): Promise<MutationResult<Payment>> => {
      const result = await apiService.createPayment(data);
      if (result.success && result.data?.payment) {
        const created = result.data.payment;
        setPayments((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
        return { ok: true, data: created };
      }
      return { ok: false, error: result.error };
    },
    []
  );

  const updatePayment = useCallback(
    async (
      id: string,
      data: UpdatePaymentRequest
    ): Promise<MutationResult<Payment>> => {
      const result = await apiService.updatePayment(id, data);
      if (result.success && result.data?.payment) {
        const updated = result.data.payment;
        setPayments((prev) =>
          Array.isArray(prev)
            ? prev.map((payment) => (payment._id === id ? updated : payment))
            : []
        );
        return { ok: true, data: updated };
      }
      return { ok: false, error: result.error };
    },
    []
  );

  const togglePaymentStatus = useCallback(
    async (id: string): Promise<ToggleResult> => {
      const result = await apiService.togglePaymentStatus(id);

      if (!result.success) {
        return { ok: false, error: result.error };
      }

      if (result.data?.deleted) {
        // Completed, so the server removed it from the active list.
        setPayments((prev) =>
          Array.isArray(prev)
            ? prev.filter((payment) => payment._id !== id)
            : []
        );
        return { ok: true, deleted: true };
      }

      if (result.data?.payment) {
        const updated = result.data.payment;
        setPayments((prev) =>
          Array.isArray(prev)
            ? prev.map((payment) => (payment._id === id ? updated : payment))
            : []
        );
        return { ok: true, deleted: false, payment: updated };
      }

      return { ok: false, error: "INVALID_RESPONSE" };
    },
    []
  );

  const deletePayment = useCallback(
    async (id: string): Promise<MutationResult<true>> => {
      const result = await apiService.deletePayment(id);
      if (result.success) {
        setPayments((prev) =>
          Array.isArray(prev)
            ? prev.filter((payment) => payment._id !== id)
            : []
        );
        return { ok: true, data: true };
      }
      return { ok: false, error: result.error };
    },
    []
  );

  const getPaymentSummaries = useCallback(async (): Promise<
    MutationResult<PaymentSummary[]>
  > => {
    setSummariesLoading(true);
    try {
      const result = await apiService.getPaymentSummaries();
      if (result.success && result.data?.summaries) {
        setSummaries(result.data.summaries);
        setSummariesError(null);
        return { ok: true, data: result.data.summaries };
      }
      setSummariesError(result.error || "REQUEST_FAILED");
      return { ok: false, error: result.error };
    } finally {
      setSummariesLoading(false);
    }
  }, []);

  /**
   * Pre-bucketed once per payments change instead of re-filtering on every
   * render of the consuming screen.
   */
  const paymentsByType = useMemo(() => {
    const source = Array.isArray(payments) ? payments : [];
    return {
      to_pay: source.filter((payment) => payment.type === "to_pay"),
      to_receive: source.filter((payment) => payment.type === "to_receive"),
    };
  }, [payments]);

  const getPaymentsByType = useCallback(
    (type: "to_pay" | "to_receive"): Payment[] => paymentsByType[type],
    [paymentsByType]
  );

  return {
    payments,
    loading,
    error,
    summaries,
    summariesLoading,
    summariesError,
    getPayments,
    getPaymentSummaries,
    createPayment,
    updatePayment,
    togglePaymentStatus,
    deletePayment,
    getPaymentsByType,
  };
};

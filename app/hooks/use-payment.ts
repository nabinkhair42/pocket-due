import { useCallback, useEffect, useMemo, useState } from "react";
import { apiService } from "../lib/api";
import {
  CreatePaymentRequest,
  PaymentSummary,
  UpdatePaymentRequest,
} from "../types/api";
import { Payment } from "../types/models";
import { offlinePayments } from "../lib/offline-payments";

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

  const applyCachedPayments = useCallback(async () => {
    const cached = await offlinePayments.loadPayments();
    if (cached.length) setPayments(cached);
    return cached;
  }, []);

  const syncPendingPayments = useCallback(async () => {
    const synced = await offlinePayments.sync();
    if (synced.payments.length) setPayments(synced.payments);
    return synced;
  }, []);

  useEffect(() => {
    applyCachedPayments();
    syncPendingPayments();
    const timer = setInterval(() => {
      syncPendingPayments();
    }, 15000);
    return () => clearInterval(timer);
  }, [applyCachedPayments, syncPendingPayments]);

  const getPayments = useCallback(async (): Promise<
    MutationResult<Payment[]>
  > => {
    setLoading(true);
    try {
      const cached = await applyCachedPayments();
      const result = await apiService.getPayments();
      if (result.success && result.data?.payments) {
        const paymentsArray = Array.isArray(result.data.payments)
          ? result.data.payments
          : [];
        setPayments(paymentsArray);
        await offlinePayments.savePayments(paymentsArray);
        setError(null);
        return { ok: true, data: paymentsArray };
      }
      if (offlinePayments.isConnectivityError(result.error) && cached.length) {
        setError(null);
        return { ok: true, data: cached };
      }
      setError(result.error || "REQUEST_FAILED");
      return { ok: false, error: result.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(
    async (data: CreatePaymentRequest): Promise<MutationResult<Payment>> => {
      const requestId = data.clientRequestId || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const request = { ...data, clientRequestId: requestId };
      const result = await apiService.createPayment(request);
      if (result.success && result.data?.payment) {
        const created = result.data.payment;
        setPayments((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
        await offlinePayments.savePayments([created, ...((await offlinePayments.loadPayments()).filter((payment) => payment._id !== created._id))]);
        return { ok: true, data: created };
      }
      if (offlinePayments.isConnectivityError(result.error)) {
        const local = offlinePayments.createLocalPayment(request);
        const cached = await offlinePayments.loadPayments();
        const next = [local, ...cached.filter((payment) => payment._id !== local._id)];
        setPayments(next);
        await offlinePayments.savePayments(next);
        await offlinePayments.enqueueCreate(local, request);
        return { ok: true, data: local };
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
        const cached = await offlinePayments.loadPayments();
        const next = cached.map((payment) => payment._id === id ? updated : payment);
        setPayments(next);
        await offlinePayments.savePayments(next);
        return { ok: true, data: updated };
      }
      if (offlinePayments.isConnectivityError(result.error)) {
        const cached = await offlinePayments.loadPayments();
        const updated = cached.find((payment) => payment._id === id);
        if (!updated) return { ok: false, error: "PAYMENT_NOT_FOUND" };
        const optimistic = { ...updated, ...data, dueDate: data.dueDate?.toISOString() || updated.dueDate, updatedAt: new Date().toISOString() };
        const next = cached.map((payment) => payment._id === id ? optimistic : payment);
        setPayments(next);
        await offlinePayments.savePayments(next);
        await offlinePayments.enqueueUpdate(id, data);
        return { ok: true, data: optimistic };
      }
      return { ok: false, error: result.error };
    },
    []
  );

  const togglePaymentStatus = useCallback(
    async (id: string): Promise<ToggleResult> => {
      const result = await apiService.togglePaymentStatus(id);

      if (!result.success) {
        if (offlinePayments.isConnectivityError(result.error)) {
          const cached = await offlinePayments.loadPayments();
          const current = cached.find((payment) => payment._id === id);
          if (!current) return { ok: false, error: "PAYMENT_NOT_FOUND" };
          const nextStatus: Payment["status"] = current.type === "to_pay"
            ? current.status === "paid" ? "unpaid" : "paid"
            : current.status === "received" ? "pending" : "received";
          const optimistic: Payment = { ...current, status: nextStatus, updatedAt: new Date().toISOString() };
          const next = cached.map((payment) => payment._id === id ? optimistic : payment);
          setPayments(next);
          await offlinePayments.savePayments(next);
          await offlinePayments.enqueueToggle(id);
          return { ok: true, deleted: false, payment: optimistic };
        }
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
        const cached = await offlinePayments.loadPayments();
        const next = cached.map((payment) => payment._id === id ? updated : payment);
        setPayments(next);
        await offlinePayments.savePayments(next);
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
        const cached = await offlinePayments.loadPayments();
        const next = cached.filter((payment) => payment._id !== id);
        setPayments(next);
        await offlinePayments.savePayments(next);
        return { ok: true, data: true };
      }
      if (offlinePayments.isConnectivityError(result.error)) {
        const cached = await offlinePayments.loadPayments();
        const next = cached.filter((payment) => payment._id !== id);
        setPayments(next);
        await offlinePayments.savePayments(next);
        await offlinePayments.enqueueDelete(id);
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
      if (offlinePayments.isConnectivityError(result.error)) {
        const cached = await offlinePayments.loadPayments();
        const localSummaries = offlinePayments.buildSummaries(cached);
        setSummaries(localSummaries);
        setSummariesError(null);
        return { ok: true, data: localSummaries };
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { CreatePaymentRequest, PaymentSummary, UpdatePaymentRequest } from "../types/api";
import { Payment } from "../types/models";
import { apiService } from "./api";

const PAYMENTS_KEY = "pocketdue.payments.v1";
const QUEUE_KEY = "pocketdue.payment-queue.v1";

type StoredCreate = Omit<CreatePaymentRequest, "dueDate"> & { dueDate: string };
type StoredUpdate = Omit<UpdatePaymentRequest, "dueDate"> & { dueDate?: string };

type QueuedOperation =
  | { id: string; kind: "create"; localId: string; data: StoredCreate }
  | { id: string; kind: "update"; paymentId: string; data: StoredUpdate }
  | { id: string; kind: "toggle"; paymentId: string }
  | { id: string; kind: "delete"; paymentId: string };

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
const isConnectivityError = (error?: string) =>
  error === "NETWORK_ERROR" || error === "TIMEOUT" || error === "SERVER_ERROR";

const readJson = async <T>(key: string, fallback: T): Promise<T> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const offlinePayments = {
  isConnectivityError,

  loadPayments: () => readJson<Payment[]>(PAYMENTS_KEY, []),

  async mergeServerPayments(serverPayments: Payment[]): Promise<Payment[]> {
    const cached = await this.loadPayments();
    const queue = await readJson<QueuedOperation[]>(QUEUE_KEY, []);
    const byId = new Map(serverPayments.map((payment) => [payment._id, payment]));
    const replacements = new Map<string, Payment>();
    const localCreates = new Map(
      cached.filter((payment) => payment._id.startsWith("local-")).map((payment) => [payment._id, payment])
    );

    for (const operation of queue) {
      if (operation.kind === "create") {
        const local = localCreates.get(operation.localId);
        const server = serverPayments.find(
          (payment) => payment.clientRequestId === operation.data.clientRequestId
        );
        if (server) replacements.set(operation.localId, server);
        else if (local && !byId.has(operation.localId)) byId.set(operation.localId, local);
        continue;
      }
      const current = byId.get(operation.paymentId) || cached.find((payment) => payment._id === operation.paymentId);
      if (!current) continue;
      if (operation.kind === "delete") {
        byId.delete(operation.paymentId);
      } else if (operation.kind === "update") {
        byId.set(operation.paymentId, {
          ...current,
          ...operation.data,
          dueDate: operation.data.dueDate || current.dueDate,
          updatedAt: new Date().toISOString(),
        });
      } else if (operation.kind === "toggle") {
        const status = current.type === "to_pay"
          ? current.status === "paid" ? "unpaid" : "paid"
          : current.status === "received" ? "pending" : "received";
        byId.set(operation.paymentId, { ...current, status, updatedAt: new Date().toISOString() });
      }
    }

    const merged: Payment[] = [];
    for (const payment of cached) {
      const replacement = replacements.get(payment._id);
      const current = replacement || byId.get(payment._id);
      if (current) {
        merged.push(current);
        byId.delete(current._id);
        byId.delete(payment._id);
      }
    }
    return [...merged, ...byId.values()];
  },

  savePayments: async (payments: Payment[]) => {
    await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  },

  buildSummaries(payments: Payment[]): PaymentSummary[] {
    const groups = new Map<string, PaymentSummary>();
    payments.forEach((payment) => {
      const summary = groups.get(payment.personName) || {
        personName: payment.personName,
        toReceive: 0,
        toPay: 0,
        netTotal: 0,
        payments: [],
      };
      if (payment.type === "to_receive") summary.toReceive += payment.amount;
      else summary.toPay += payment.amount;
      summary.netTotal = summary.toReceive - summary.toPay;
      summary.payments.push({
        _id: payment._id,
        type: payment.type,
        amount: payment.amount,
        description: payment.description,
        dueDate: new Date(payment.dueDate),
        status: payment.status,
        createdAt: new Date(payment.createdAt),
      });
      groups.set(payment.personName, summary);
    });
    return [...groups.values()].sort(
      (a, b) => Math.abs(b.netTotal) - Math.abs(a.netTotal)
    );
  },

  createLocalPayment(data: CreatePaymentRequest): Payment {
    const requestId = data.clientRequestId || makeId();
    const now = new Date().toISOString();
    return {
      _id: `local-${requestId}`,
      clientRequestId: requestId,
      userId: "local",
      type: data.type,
      personName: data.personName,
      amount: data.amount,
      dueDate: data.dueDate.toISOString(),
      description: data.description,
      status: data.type === "to_pay" ? "unpaid" : "pending",
      createdAt: now,
      updatedAt: now,
    };
  },

  async enqueueCreate(payment: Payment, data: CreatePaymentRequest) {
    const queue = await readJson<QueuedOperation[]>(QUEUE_KEY, []);
    queue.push({
      id: makeId(),
      kind: "create",
      localId: payment._id,
      data: {
        ...data,
        clientRequestId: payment.clientRequestId,
        dueDate: data.dueDate.toISOString(),
      },
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async enqueueUpdate(paymentId: string, data: UpdatePaymentRequest) {
    const queue = await readJson<QueuedOperation[]>(QUEUE_KEY, []);
    queue.push({
      id: makeId(),
      kind: "update",
      paymentId,
      data: { ...data, dueDate: data.dueDate?.toISOString() },
    });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async enqueueToggle(paymentId: string) {
    const queue = await readJson<QueuedOperation[]>(QUEUE_KEY, []);
    queue.push({ id: makeId(), kind: "toggle", paymentId });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async enqueueDelete(paymentId: string) {
    const queue = await readJson<QueuedOperation[]>(QUEUE_KEY, []);
    const createIndex = queue.findIndex(
      (operation) => operation.kind === "create" && operation.localId === paymentId
    );
    if (createIndex >= 0) {
      queue.splice(createIndex, 1);
      const remaining = queue.filter(
        (operation) => !("paymentId" in operation) || operation.paymentId !== paymentId
      );
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
      return;
    }
    queue.push({ id: makeId(), kind: "delete", paymentId });
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async sync(): Promise<{ payments: Payment[]; pending: number }> {
    let payments = await this.loadPayments();
    const queue = await readJson<QueuedOperation[]>(QUEUE_KEY, []);
    const remaining: QueuedOperation[] = [];
    const idMap = new Map<string, string>();

    for (let index = 0; index < queue.length; index += 1) {
      const operation = queue[index];
      const resolveId = (id: string) => idMap.get(id) || id;
      let succeeded = false;

      if (operation.kind === "create") {
        const result = await apiService.createPayment({
          ...operation.data,
          dueDate: new Date(operation.data.dueDate),
        });
        if (result.success && result.data?.payment) {
          const serverPayment = result.data.payment;
          idMap.set(operation.localId, serverPayment._id);
          payments = payments.map((payment) =>
            payment._id === operation.localId ? serverPayment : payment
          );
          succeeded = true;
        } else if (!isConnectivityError(result.error)) {
          succeeded = true;
        }
      } else {
        const paymentId = resolveId(operation.paymentId);
        const result =
          operation.kind === "update"
            ? await apiService.updatePayment(paymentId, {
                ...operation.data,
                dueDate: operation.data.dueDate
                  ? new Date(operation.data.dueDate)
                  : undefined,
              })
            : operation.kind === "toggle"
              ? await apiService.togglePaymentStatus(paymentId)
              : await apiService.deletePayment(paymentId);

        if (result.success) {
          if (operation.kind === "update" && result.data?.payment) {
            payments = payments.map((payment) =>
              payment._id === paymentId ? result.data!.payment! : payment
            );
          } else if (operation.kind === "toggle" && result.data?.payment) {
            payments = payments.map((payment) =>
              payment._id === paymentId ? result.data!.payment! : payment
            );
          } else if (operation.kind === "delete") {
            payments = payments.filter((payment) => payment._id !== paymentId);
          }
          succeeded = true;
        } else if (!isConnectivityError(result.error)) {
          succeeded = true;
        }
      }

      if (!succeeded) {
        const pending = [operation, ...queue.slice(index + 1)].map((item) => {
          if ("paymentId" in item) {
            return { ...item, paymentId: resolveId(item.paymentId) } as QueuedOperation;
          }
          return item;
        });
        remaining.push(...pending);
        break;
      }
    }

    await this.savePayments(payments);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    return { payments, pending: remaining.length };
  },
};

import { API_BASE_URL, authClient } from "./auth-client";
import { Platform } from "react-native";
import {
  ApiResponse,
  CreatePaymentRequest,
  PaymentResponse,
  PaymentsResponse,
  PaymentSummary,
  UpdatePaymentRequest,
  UserResponse,
} from "../types/api";

const REQUEST_TIMEOUT_MS = 30000;

type AuthFailureListener = () => void;

class ApiService {
  private authFailureListeners = new Set<AuthFailureListener>();

  onAuthFailure(listener: AuthFailureListener): () => void {
    this.authFailureListeners.add(listener);
    return () => {
      this.authFailureListeners.delete(listener);
    };
  }

  private emitAuthFailure(): void {
    this.authFailureListeners.forEach((listener) => listener());
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const cookie = Platform.OS === "web" ? "" : authClient.getCookie();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (cookie) {
        headers.Cookie = cookie;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: Platform.OS === "web" ? "include" : "omit",
        signal: controller.signal,
      });

      let data: ApiResponse<T> | null = null;
      const rawBody = await response.text();
      if (rawBody) {
        try {
          data = JSON.parse(rawBody) as ApiResponse<T>;
        } catch {
          return {
            success: false,
            message: "Unexpected server response",
            error: response.ok ? "INVALID_RESPONSE" : "SERVER_ERROR",
          };
        }
      }

      if (response.status === 401) {
        this.emitAuthFailure();
        return {
          success: false,
          message: data?.message || "Session expired",
          error: "UNAUTHORIZED",
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || "Request failed",
          error:
            data?.error ||
            (response.status >= 500 ? "SERVER_ERROR" : "REQUEST_FAILED"),
        };
      }

      if (data === null) {
        return { success: true } as ApiResponse<T>;
      }

      return data;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        return {
          success: false,
          message: "The request timed out. Please try again.",
          error: "TIMEOUT",
        };
      }
      return {
        success: false,
        message: "Can't reach the server. Check your connection.",
        error: "NETWORK_ERROR",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async updateProfile(data: {
    name?: string;
  }): Promise<ApiResponse<UserResponse>> {
    const result = await authClient.updateUser(data);
    if (result.error) {
      return { success: false, message: result.error.message, error: "REQUEST_FAILED" };
    }
    const session = await authClient.getSession();
    if (!session.data?.user) {
      return { success: false, message: "Failed to update profile", error: "REQUEST_FAILED" };
    }
    const user = session.data.user;
    return {
      success: true,
      data: {
        user: {
          _id: user.id,
          email: user.email,
          name: user.name,
          image: user.image ?? undefined,
          createdAt: new Date(user.createdAt).toISOString(),
          updatedAt: new Date(user.updatedAt).toISOString(),
        },
      },
    };
  }

  async deleteAccount(): Promise<ApiResponse> {
    const result = await authClient.deleteUser();
    return result?.error ? { success: false, message: result.error.message, error: "REQUEST_FAILED" } : { success: true };
  }

  async getPayments(): Promise<ApiResponse<PaymentsResponse>> {
    return this.makeRequest<PaymentsResponse>("/api/payments");
  }

  async createPayment(
    data: CreatePaymentRequest,
  ): Promise<ApiResponse<PaymentResponse>> {
    return this.makeRequest<PaymentResponse>("/api/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePayment(
    id: string,
    data: UpdatePaymentRequest,
  ): Promise<ApiResponse<PaymentResponse>> {
    return this.makeRequest<PaymentResponse>(`/api/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async togglePaymentStatus(id: string): Promise<ApiResponse<PaymentResponse>> {
    return this.makeRequest<PaymentResponse>(`/api/payments/${id}/toggle`, {
      method: "PATCH",
    });
  }

  async deletePayment(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/payments/${id}`, {
      method: "DELETE",
    });
  }

  async getPreviousUsers(): Promise<ApiResponse<{ previousUsers: string[] }>> {
    return this.makeRequest<{ previousUsers: string[] }>(
      "/api/payments/previous-users",
    );
  }

  async getPaymentSummaries(): Promise<
    ApiResponse<{ summaries: PaymentSummary[] }>
  > {
    return this.makeRequest<{ summaries: PaymentSummary[] }>(
      "/api/payments/summaries",
    );
  }
}

export const apiService = new ApiService();

// API service for PocketDue mobile app
import { API_BASE_URL, authClient } from "./auth-client";
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

  /**
   * Lets the auth layer react to an expired/rejected token. The transport
   * detects the 401; this is the channel back to UI state.
   * Returns an unsubscribe function.
   */
  onAuthFailure(listener: AuthFailureListener): () => void {
    this.authFailureListeners.add(listener);
    return () => {
      this.authFailureListeners.delete(listener);
    };
  }

  private emitAuthFailure(): void {
    this.authFailureListeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {}
    });
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const cookie = (authClient as any).getCookie?.() as string | undefined;

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
        signal: controller.signal,
      });

      // A gateway error page or a 204 body is not JSON; parsing it must not
      // masquerade as a network failure.
      let data: any = null;
      const rawBody = await response.text();
      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch (error) {
          return {
            success: false,
            message: "Unexpected server response",
            error: response.ok ? "INVALID_RESPONSE" : "SERVER_ERROR",
          };
        }
      }

      // Expired or rejected token: clear it and notify the auth layer so the
      // user is actually sent back to sign-in instead of seeing empty data.
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

      // A successful response with no body (e.g. 204) still has to satisfy the
      // ApiResponse contract callers destructure.
      if (data === null) {
        return { success: true } as ApiResponse<T>;
      }

      return data;
    } catch (error: any) {
      if (error?.name === "AbortError") {
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
    email?: string;
  }): Promise<ApiResponse<UserResponse>> {
    const result = await (authClient as any).updateUser(data);
    if (result?.data?.user) return { success: true, data: { user: result.data.user } } as any;
    return { success: false, message: result?.error?.message || "Failed to update profile", error: "REQUEST_FAILED" };
  }

  async deleteAccount(): Promise<ApiResponse> {
    const result = await (authClient as any).deleteUser();
    return result?.error ? { success: false, message: result.error.message, error: "REQUEST_FAILED" } : { success: true };
  }

  // Payment methods
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

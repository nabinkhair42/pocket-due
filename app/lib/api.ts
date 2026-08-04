// API service for PocketDue mobile app
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ApiResponse,
  AuthResponse,
  CreatePaymentRequest,
  LoginRequest,
  PaymentResponse,
  PaymentsResponse,
  PaymentSummary,
  RegisterRequest,
  UpdatePaymentRequest,
  UserResponse,
} from "../types/api";

const API_BASE_URL = "http://localhost:3000";
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

  async hasToken(): Promise<boolean> {
    return (await this.getToken()) !== null;
  }

  private async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("authToken");
      return token;
    } catch (error) {
      return null;
    }
  }

  private async setToken(token: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem("authToken", token);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {}
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const token = await this.getToken();

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
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
        await this.removeToken();
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

  // Auth methods
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      const stored = await this.setToken(response.data.token);
      if (!stored) {
        return {
          success: false,
          message: "Couldn't save your session. Please try again.",
          error: "STORAGE_ERROR",
        };
      }
    }

    return response;
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      const stored = await this.setToken(response.data.token);
      if (!stored) {
        return {
          success: false,
          message: "Couldn't save your session. Please try again.",
          error: "STORAGE_ERROR",
        };
      }
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    // Send the request while still authenticated, then drop the token
    // regardless of the outcome.
    const response = await this.makeRequest("/auth/logout", {
      method: "POST",
    });
    await this.removeToken();
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<UserResponse>> {
    return this.makeRequest<UserResponse>("/auth/me", {
      method: "GET",
    });
  }

  async updateProfile(data: {
    name?: string;
    email?: string;
  }): Promise<ApiResponse<UserResponse>> {
    return this.makeRequest<UserResponse>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.makeRequest("/auth/password", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(data: { password: string }): Promise<ApiResponse> {
    return this.makeRequest("/auth/account", {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  }

  // Payment methods
  async getPayments(): Promise<ApiResponse<PaymentsResponse>> {
    return this.makeRequest<PaymentsResponse>("/payments");
  }

  async createPayment(
    data: CreatePaymentRequest,
  ): Promise<ApiResponse<PaymentResponse>> {
    return this.makeRequest<PaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePayment(
    id: string,
    data: UpdatePaymentRequest,
  ): Promise<ApiResponse<PaymentResponse>> {
    return this.makeRequest<PaymentResponse>(`/payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async togglePaymentStatus(id: string): Promise<ApiResponse<PaymentResponse>> {
    return this.makeRequest<PaymentResponse>(`/payments/${id}/toggle`, {
      method: "PATCH",
    });
  }

  async deletePayment(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/payments/${id}`, {
      method: "DELETE",
    });
  }

  async getPreviousUsers(): Promise<ApiResponse<{ previousUsers: string[] }>> {
    return this.makeRequest<{ previousUsers: string[] }>(
      "/payments/previous-users",
    );
  }

  async getPaymentSummaries(): Promise<
    ApiResponse<{ summaries: PaymentSummary[] }>
  > {
    return this.makeRequest<{ summaries: PaymentSummary[] }>(
      "/payments/summaries",
    );
  }
}

export const apiService = new ApiService();

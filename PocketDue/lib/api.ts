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

const API_BASE_URL = "https://pocket-due.vercel.app/api";

class ApiService {
  private async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem("authToken");
      return token;
    } catch (error) {
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {}
  }

  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {}
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
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
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Request failed",
          error: data.error || "Network error",
        };
      }

      return data;
    } catch (error: any) {
      return {
        success: false,
        message: "Request failed",
        error: error.message || "Network error",
      };
    }
  }

  // Auth methods
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      await this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    await this.removeToken();
    return this.makeRequest("/auth/logout", {
      method: "POST",
    });
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
    data: CreatePaymentRequest
  ): Promise<ApiResponse<PaymentResponse>> {
    return this.makeRequest<PaymentResponse>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePayment(
    id: string,
    data: UpdatePaymentRequest
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
    console.log("Making getPreviousUsers API call...");
    const response = await this.makeRequest<{ previousUsers: string[] }>(
      "/payments/previous-users"
    );
    console.log("getPreviousUsers response:", response);
    return response;
  }

  async getPaymentSummaries(): Promise<
    ApiResponse<{ summaries: PaymentSummary[] }>
  > {
    return this.makeRequest<{ summaries: PaymentSummary[] }>(
      "/payments/summaries"
    );
  }
}

export const apiService = new ApiService();

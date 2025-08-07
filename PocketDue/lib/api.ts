// API service for PocketDue mobile app
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.66:3000/api";

export interface User {
  _id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  userId: string;
  type: "to_pay" | "to_receive";
  personName: string;
  amount: number;
  dueDate: string;
  description?: string;
  status: "paid" | "unpaid" | "received" | "pending";
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  type: "to_pay" | "to_receive";
  personName: string;
  amount: number;
  dueDate: Date;
  description?: string;
}

export interface UpdatePaymentRequest {
  type?: "to_pay" | "to_receive";
  personName?: string;
  amount?: number;
  dueDate?: Date;
  description?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaymentsResponse {
  payments: Payment[];
}

export interface PaymentResponse {
  payment: Payment;
}

export interface UserResponse {
  user: User;
}

class ApiService {
  private async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  private async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem("authToken", token);
    } catch (error) {
      console.error("Error setting token:", error);
    }
  }

  private async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.error("Error removing token:", error);
    }
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

      console.log(`Making request to: ${API_BASE_URL}${endpoint}`);
      console.log("Headers:", headers);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Request failed",
          error: data.error || "Network error",
        };
      }

      return data;
    } catch (error: any) {
      console.error("API Error:", error);
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
    return this.makeRequest<UserResponse>("/auth/me");
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
}

export const apiService = new ApiService();

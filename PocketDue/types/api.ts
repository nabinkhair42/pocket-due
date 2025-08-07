import { User, Payment } from "./models";

// API Response Types
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
  payment: Payment | null;
  deleted?: boolean;
}

export interface UserResponse {
  user: User;
}

// Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
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

export interface PaymentSummary {
  personName: string;
  toReceive: number;
  toPay: number;
  netTotal: number;
  payments: Array<{
    _id: string;
    type: "to_pay" | "to_receive";
    amount: number;
    description?: string;
    dueDate: Date;
    status: "paid" | "unpaid" | "received" | "pending";
    createdAt: Date;
  }>;
}

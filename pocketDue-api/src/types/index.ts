import { Request } from "express";

export interface User {
  _id: string;
  email: string;
  name: string;
  googleId?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id: string;
  userId: string;
  type: "to_pay" | "to_receive";
  personName: string;
  amount: number;
  dueDate: Date;
  description?: string;
  status: "paid" | "unpaid" | "received" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: User;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos: Array<{ value: string }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
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

export interface ApiResponse<T = Record<string, unknown>> {
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

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

import { Request } from "express";

export interface User {
  _id: string;
  email: string;
  name: string;
  googleId?: string;
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


export interface CreatePaymentRequest {
  clientRequestId?: string;
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

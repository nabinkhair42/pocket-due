// Model Types
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

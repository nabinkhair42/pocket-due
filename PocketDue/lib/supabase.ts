import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pzrkrfjndapvuxgypaek.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmtyZmpuZGFwdnV4Z3lwYWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjIxMjEsImV4cCI6MjA3MDEzODEyMX0.jVnmhkLVRT5ZMTzqIlYRw9jrjE1J9tjEnkeNSrur6aY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Payment = {
  id: string;
  user_id: string;
  type: "to_pay" | "to_receive";
  name: string;
  description?: string;
  amount: number;
  due_date: string;
  status: "paid" | "unpaid" | "received" | "pending";
  created_at: string;
};

export type PaymentFormData = Omit<Payment, "id" | "user_id" | "created_at">;

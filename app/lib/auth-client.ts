import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      scheme: "pocketdue",
      storagePrefix: "pocketdue",
      cookiePrefix: "pocketdue",
      storage: SecureStore,
    }),
  ],
} as any);

export type SocialProvider = "google" | "github";

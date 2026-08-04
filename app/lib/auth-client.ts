import { expoClient } from "@better-auth/expo/client";
import type { BetterAuthClientPlugin } from "better-auth";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ?? "https://pocket-due.vercel.app";

const expoPlugin = expoClient({
  scheme: "pocketdue",
  storagePrefix: "pocketdue",
  cookiePrefix: "pocketdue",
  storage: SecureStore,
}) as unknown as BetterAuthClientPlugin;

const client = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [expoPlugin],
});

export const authClient = client as typeof client & { getCookie: () => string };

export type SocialProvider = "google" | "github";

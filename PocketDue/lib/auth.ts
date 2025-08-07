import { supabase } from "./supabase";
import * as WebBrowser from "expo-web-browser";

// Auth configuration
export const AUTH_CONFIG = {
  // OAuth redirect URLs
  oauth: {
    google: {
      redirectTo: "https://pzrkrfjndapvuxgypaek.supabase.co/auth/v1/callback",
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  },
  // Email OTP settings
  email: {
    shouldConfirmEmail: false, // Use OTP instead of email confirmation
    redirectTo: "https://pzrkrfjndapvuxgypaek.supabase.co/auth/v1/callback",
  },
};

// Google OAuth sign in
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: AUTH_CONFIG.oauth.google.redirectTo,
        queryParams: AUTH_CONFIG.oauth.google.queryParams,
      },
    });

    if (error) throw error;

    if (data?.url) {
      console.log("OAuth URL:", data.url);

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        AUTH_CONFIG.oauth.google.redirectTo
      );

      console.log("OAuth result:", result);

      if (result.type === "success") {
        console.log("OAuth flow completed successfully");
        return { success: true };
      } else if (result.type === "cancel") {
        console.log("User cancelled OAuth flow");
        return { success: false, error: "User cancelled" };
      } else {
        console.log("OAuth flow failed:", result.type);
        return { success: false, error: "OAuth flow failed" };
      }
    }

    return { success: false, error: "No OAuth URL received" };
  } catch (error: any) {
    console.error("OAuth error:", error);
    return {
      success: false,
      error: error.message || "Failed to sign in with Google",
    };
  }
};

// Email OTP sign in
export const signInWithEmail = async (email: string) => {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true, // Create user if doesn't exist
        emailRedirectTo: AUTH_CONFIG.email.redirectTo,
        data: {
          // Additional user metadata if needed
        },
      },
    });

    if (error) throw error;

    return { success: true, message: "OTP sent to your email" };
  } catch (error: any) {
    console.error("Email OTP error:", error);
    return { success: false, error: error.message || "Failed to send OTP" };
  }
};

// Verify OTP
export const verifyOTP = async (email: string, token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    if (error) throw error;

    console.log("OTP verification successful:", data);
    return { success: true, session: data.session };
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return { success: false, error: error.message || "Failed to verify OTP" };
  }
};

// Sign out
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message || "Failed to sign out" };
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return { success: true, session };
  } catch (error: any) {
    console.error("Get session error:", error);
    return { success: false, error: error.message || "Failed to get session" };
  }
};

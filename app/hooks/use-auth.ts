/**
 * Auth state lives in a single provider (contexts/auth-context.tsx) so the whole
 * app shares one `user` and one /auth/me bootstrap.
 *
 * This file previously declared `useState` inside the hook, which meant every
 * call site got its own private user state and fired its own /auth/me on mount —
 * five disjoint answers to "is this user signed in", none authoritative.
 *
 * Re-exported here so existing `../hooks/use-auth` imports keep working.
 */
export { useAuth, AuthProvider } from "../contexts/auth-context";
export type { AuthStatus } from "../contexts/auth-context";

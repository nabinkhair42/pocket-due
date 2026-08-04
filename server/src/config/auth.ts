import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { Payment } from "../models/payment.js";
import { authDatabase, authMongoClient } from "./database.js";
import { config } from "./env.js";

export const auth = betterAuth({
  appName: "PocketDue",
  baseURL: config.BETTER_AUTH_URL,
  basePath: "/api/auth",
  secret: config.BETTER_AUTH_SECRET,
  database: mongodbAdapter(authDatabase, {
    client: authMongoClient,
    transaction: config.NODE_ENV === "production",
  }),
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
    },
  },
  user: {
    // Reuse the legacy Mongoose collection so OAuth sign-in by an existing
    // email retains the same ObjectId and therefore the same payment ownership.
    modelName: "users",
    deleteUser: { enabled: true },
  },
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google", "github"] },
    encryptOAuthTokens: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5, strategy: "jwe" },
  },
  trustedOrigins: config.ALLOWED_ORIGINS,
  rateLimit: { enabled: true, storage: "database", window: 60, max: 100 },
  advanced: {
    useSecureCookies: config.NODE_ENV === "production",
    cookiePrefix: "pocketdue",
  },
  databaseHooks: {
    user: {
      delete: {
        before: async (user) => {
          await Payment.deleteMany({ userId: user.id });
        },
      },
    },
  },
  plugins: [expo()],
});

export type AuthSession = typeof auth.$Infer.Session;

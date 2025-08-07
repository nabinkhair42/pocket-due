import { Request, Response, RequestHandler } from "express";
import express from "express";
import jwt from "jsonwebtoken";
import { authService } from "../features/auth/authService";
import {
  validateRequest,
  registerValidationRules,
  authValidationRules,
} from "../utils/validation";
import { handleAsync } from "../utils/errorHandler";
import { authRateLimit } from "../middleware/rateLimit";
import { authenticateToken } from "../middleware/auth";
import { config } from "../config/env";
import { LoginRequest, RegisterRequest, AuthRequest } from "../types";

const router = express.Router();

// Register
router.post(
  "/register",
  authRateLimit.middleware,
  validateRequest(registerValidationRules),
  handleAsync(async (req: Request, res: Response): Promise<void> => {
    const userData = req.body as RegisterRequest;
    const result = await authService.register(userData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });
  })
);

// Login
router.post(
  "/login",
  authRateLimit.middleware,
  validateRequest(authValidationRules),
  handleAsync(async (req: Request, res: Response): Promise<void> => {
    const credentials = req.body as LoginRequest;
    const result = await authService.login(credentials);

    res.json({
      success: true,
      message: "Login successful",
      data: result,
    });
  })
);

// Logout
router.post(
  "/logout",
  handleAsync(async (req: Request, res: Response): Promise<void> => {
    // For JWT-based auth, logout is handled client-side by removing the token
    // The server doesn't need to do anything special
    res.json({
      success: true,
      message: "Logout successful",
    });
  })
);

// Get current user
router.get(
  "/me",
  handleAsync(async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res.status(401).json({
        success: false,
        message: "No token provided",
        error: "Authentication required",
      });
      return;
    }

    const decoded = jwt.verify(token as string, config.JWT_SECRET) as {
      userId: string;
    };
    const user = await authService.getCurrentUser(decoded.userId);

    res.json({
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  })
);

// Update profile
router.put(
  "/profile",
  authenticateToken as unknown as RequestHandler,
  validateRequest([
    {
      field: "name",
      required: false,
      type: "string",
      minLength: 2,
      maxLength: 50,
    },
    { field: "email", required: false, type: "email" },
  ]),
  handleAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as unknown as AuthRequest).user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "User not authenticated",
      });
      return;
    }

    const { name, email } = req.body;
    const user = await authService.updateProfile(userId as string, {
      name,
      email,
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  })
);

// Change password
router.put(
  "/password",
  authenticateToken as unknown as RequestHandler,
  validateRequest([
    { field: "currentPassword", required: true, type: "string", minLength: 6 },
    { field: "newPassword", required: true, type: "string", minLength: 6 },
  ]),
  handleAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as unknown as AuthRequest).user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "User not authenticated",
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(
      userId as string,
      currentPassword,
      newPassword
    );

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  })
);

// Delete account
router.delete(
  "/account",
  authenticateToken as unknown as RequestHandler,
  validateRequest([
    { field: "password", required: true, type: "string", minLength: 6 },
  ]),
  handleAsync(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as unknown as AuthRequest).user?._id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "User not authenticated",
      });
      return;
    }

    const { password } = req.body;
    await authService.deleteAccount(userId as string, password);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  })
);

export default router;

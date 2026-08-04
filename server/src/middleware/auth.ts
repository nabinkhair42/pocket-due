import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload, ApiResponse, User } from "../types";
import { User as UserModel } from "../models/user";
import { config } from "../config/env";

const JWT_OPTIONS = {
  algorithms: ["HS256"] as jwt.Algorithm[],
  issuer: "pocket-due-api",
  audience: "pocket-due-app",
};

export const authenticateToken = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const [scheme, token, extra] = authHeader?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token || extra) {
      res.status(401).json({
        success: false,
        message: "Access token required",
        error: "No token provided",
      });
      return;
    }

    const decoded = jwt.verify(token, config.JWT_SECRET, JWT_OPTIONS) as JwtPayload;
    if (!decoded.userId || !decoded.email) throw new Error("Invalid token payload");
    const user = await UserModel.findById(decoded.userId).select("-password");

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
        error: "User not found",
      });
      return;
    }

    req.user = user as unknown as User;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
      error: "Token verification failed",
    });
  }
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, config.JWT_SECRET, {
    algorithm: "HS256",
    issuer: JWT_OPTIONS.issuer,
    audience: JWT_OPTIONS.audience,
    expiresIn: "7d",
  });
};

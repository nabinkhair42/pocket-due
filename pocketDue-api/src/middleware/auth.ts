import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JwtPayload, ApiResponse, User } from "../types";
import { User as UserModel } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = async (
  req: AuthRequest,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
        error: "No token provided",
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
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
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "7d" });
};

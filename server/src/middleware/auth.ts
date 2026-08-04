import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }
    (req as Request & { user: Record<string, string> }).user = {
      _id: session.user.id,
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
    next();
  } catch (error) {
    next(error);
  }
};

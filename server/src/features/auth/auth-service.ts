import { User, IUser } from "../../models/user";
import { LoginRequest, RegisterRequest } from "../../types";
import { generateToken } from "../../middleware/auth";
import { createError } from "../../utils/error-handler";
import { logger } from "../../utils/logger";

export class AuthService {
  async register(
    userData: RegisterRequest
  ): Promise<{ user: IUser; token: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw createError("User already exists", 400);
      }

      // Create new user
      const user = new User({
        email: userData.email,
        password: userData.password,
        name: userData.name,
      });

      await user.save();

      // Generate token
      const token = generateToken((user._id as string).toString(), user.email);

      logger.info("User registered", { userId: user._id, email: user.email });

      return { user: user.toObject() as IUser, token };
    } catch (error) {
      logger.error("Error registering user", { error, email: userData.email });
      throw error;
    }
  }

  async login(
    credentials: LoginRequest
  ): Promise<{ user: IUser; token: string }> {
    try {
      // Find user
      const user = await User.findOne({ email: credentials.email });
      if (!user) {
        throw createError("Invalid credentials", 401);
      }

      // Check password
      const isPasswordValid = await user.comparePassword(credentials.password);
      if (!isPasswordValid) {
        throw createError("Invalid credentials", 401);
      }

      // Generate token
      const token = generateToken((user._id as string).toString(), user.email);

      logger.info("User logged in", { userId: user._id, email: user.email });

      return { user: user.toObject() as IUser, token };
    } catch (error) {
      logger.error("Error logging in user", {
        error,
        email: credentials.email,
      });
      throw error;
    }
  }

  async getCurrentUser(userId: string): Promise<IUser> {
    try {
      const user = await User.findById(userId).select("-password");

      if (!user) {
        throw createError("User not found", 404);
      }

      return user.toObject() as IUser;
    } catch (error) {
      logger.error("Error getting current user", { error, userId });
      throw error;
    }
  }

  async updateProfile(
    userId: string,
    updateData: { name?: string; email?: string }
  ): Promise<IUser> {
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        throw createError("User not found", 404);
      }

      logger.info("User profile updated", { userId, updateData });
      return user.toObject() as IUser;
    } catch (error) {
      logger.error("Error updating user profile", { error, userId });
      throw error;
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw createError("User not found", 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        throw createError("Current password is incorrect", 400);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info("User password changed", { userId });
    } catch (error) {
      logger.error("Error changing password", { error, userId });
      throw error;
    }
  }

  async deleteAccount(userId: string, password: string): Promise<void> {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw createError("User not found", 404);
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw createError("Password is incorrect", 400);
      }

      // Delete user (this will cascade to payments if foreign key constraints are set up)
      await User.findByIdAndDelete(userId);

      logger.info("User account deleted", { userId });
    } catch (error) {
      logger.error("Error deleting user account", { error, userId });
      throw error;
    }
  }
}

export const authService = new AuthService();

import { Payment, IPayment } from "../../models/Payment";
import { User } from "../../models/User";
import { CreatePaymentRequest, UpdatePaymentRequest } from "../../types";
import { createError } from "../../utils/errorHandler";
import { logger } from "../../utils/logger";

export class PaymentService {
  async createPayment(
    userId: string,
    paymentData: CreatePaymentRequest
  ): Promise<IPayment> {
    try {
      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw createError("User not found", 404);
      }

      const payment = new Payment({
        userId,
        ...paymentData,
        dueDate: new Date(paymentData.dueDate),
      });

      await payment.save();

      logger.info("Payment created", { paymentId: payment._id, userId });
      return payment;
    } catch (error) {
      logger.error("Error creating payment", { error, userId });
      throw error;
    }
  }

  async getPayments(userId: string, type?: string): Promise<IPayment[]> {
    try {
      const query: Record<string, string> = { userId };

      if (type && ["to_pay", "to_receive"].includes(type)) {
        query.type = type;
      }

      const payments = await Payment.find(query)
        .sort({ createdAt: -1 })
        .populate("userId", "name email");

      logger.info("Payments retrieved", { count: payments.length, userId });
      return payments;
    } catch (error) {
      logger.error("Error retrieving payments", { error, userId });
      throw error;
    }
  }

  async getPaymentById(userId: string, paymentId: string): Promise<IPayment> {
    try {
      const payment = await Payment.findOne({ _id: paymentId, userId });

      if (!payment) {
        throw createError("Payment not found", 404);
      }

      return payment;
    } catch (error) {
      logger.error("Error retrieving payment", { error, paymentId, userId });
      throw error;
    }
  }

  async updatePayment(
    userId: string,
    paymentId: string,
    updateData: UpdatePaymentRequest
  ): Promise<IPayment> {
    try {
      const payment = await Payment.findOneAndUpdate(
        { _id: paymentId, userId },
        {
          ...updateData,
          ...(updateData.dueDate && { dueDate: new Date(updateData.dueDate) }),
        },
        { new: true, runValidators: true }
      );

      if (!payment) {
        throw createError("Payment not found", 404);
      }

      logger.info("Payment updated", { paymentId, userId });
      return payment;
    } catch (error) {
      logger.error("Error updating payment", { error, paymentId, userId });
      throw error;
    }
  }

  async togglePaymentStatus(
    userId: string,
    paymentId: string
  ): Promise<IPayment> {
    try {
      const payment = await Payment.findOne({ _id: paymentId, userId });

      if (!payment) {
        throw createError("Payment not found", 404);
      }

      // Toggle status based on type
      if (payment.type === "to_pay") {
        payment.status = payment.status === "paid" ? "unpaid" : "paid";
      } else {
        payment.status = payment.status === "received" ? "pending" : "received";
      }

      await payment.save();

      logger.info("Payment status toggled", {
        paymentId,
        userId,
        newStatus: payment.status,
      });

      return payment;
    } catch (error) {
      logger.error("Error toggling payment status", {
        error,
        paymentId,
        userId,
      });
      throw error;
    }
  }

  async deletePayment(userId: string, paymentId: string): Promise<IPayment> {
    try {
      const payment = await Payment.findOneAndDelete({
        _id: paymentId,
        userId,
      });

      if (!payment) {
        throw createError("Payment not found", 404);
      }

      logger.info("Payment deleted", { paymentId, userId });
      return payment;
    } catch (error) {
      logger.error("Error deleting payment", { error, paymentId, userId });
      throw error;
    }
  }

  async getPaymentStats(userId: string): Promise<{
    totalPayments: number;
    totalAmount: number;
    paidPayments: number;
    unpaidPayments: number;
    overduePayments: number;
  }> {
    try {
      const payments = await Payment.find({ userId });

      const now = new Date();
      const stats = {
        totalPayments: payments.length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        paidPayments: payments.filter(
          (p) => p.status === "paid" || p.status === "received"
        ).length,
        unpaidPayments: payments.filter(
          (p) => p.status === "unpaid" || p.status === "pending"
        ).length,
        overduePayments: payments.filter(
          (p) =>
            (p.status === "unpaid" || p.status === "pending") &&
            new Date(p.dueDate) < now
        ).length,
      };

      logger.info("Payment stats retrieved", { userId, stats });
      return stats;
    } catch (error) {
      logger.error("Error retrieving payment stats", { error, userId });
      throw error;
    }
  }

  async getPreviousUsers(userId: string): Promise<string[]> {
    try {
      // Get unique person names from user's payment history
      const payments = await Payment.find({ userId }).select('personName');
      
      // Extract unique person names and sort them
      const uniqueNames = [...new Set(payments.map(p => p.personName))].sort();
      
      logger.info("Previous users retrieved", { userId, count: uniqueNames.length });
      return uniqueNames;
    } catch (error) {
      logger.error("Error retrieving previous users", { error, userId });
      throw error;
    }
  }
}

export const paymentService = new PaymentService();

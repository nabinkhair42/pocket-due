import { Payment, IPayment } from "../../models/payment";
import { CreatePaymentRequest, UpdatePaymentRequest } from "../../types";
import { createError } from "../../utils/error-handler";
import { logger } from "../../utils/logger";

export class PaymentService {
  async createPayment(
    userId: string,
    paymentData: CreatePaymentRequest
  ): Promise<IPayment> {
    try {
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

  async getPayments(userId: string, type?: string, limit = 50, cursor?: string): Promise<IPayment[]> {
    try {
      const query: Record<string, string> = { userId };

      if (type && ["to_pay", "to_receive"].includes(type)) {
        query.type = type;
      }

      const filter: any = { ...query };
      if (cursor) filter.createdAt = { $lt: new Date(cursor) };
      const payments = await Payment.find(filter).sort({ createdAt: -1 }).limit(Math.min(limit, 100)).lean();

      logger.info("Payments retrieved", { count: payments.length, userId });
      return payments;
    } catch (error) {
      logger.error("Error retrieving payments", { error, userId });
      throw error;
    }
  }

  async getPaymentById(userId: string, paymentId: string): Promise<IPayment> {
    try {
      const payment = await Payment.findOne({ _id: paymentId, userId }).lean();

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
      const allowed: any = {};
      if (updateData.type !== undefined) allowed.type = updateData.type;
      if (updateData.personName !== undefined) allowed.personName = updateData.personName;
      if (updateData.amount !== undefined) allowed.amount = updateData.amount;
      if (updateData.description !== undefined) allowed.description = updateData.description;
      if (updateData.dueDate !== undefined) allowed.dueDate = new Date(updateData.dueDate);
      const payment = await Payment.findOneAndUpdate(
        { _id: paymentId, userId },
        {
          $set: allowed,
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
  ): Promise<IPayment | null> {
    try {
      const existing = await Payment.findOne({ _id: paymentId, userId }).lean();

      if (!existing) {
        throw createError("Payment not found", 404);
      }

      const nextStatus = existing.type === "to_pay" ? (existing.status === "paid" ? "unpaid" : "paid") : (existing.status === "received" ? "pending" : "received");
      const payment = await Payment.findOneAndUpdate({ _id: paymentId, userId, status: existing.status }, { $set: { status: nextStatus } }, { new: true, runValidators: true }).lean();

      if (!payment) {
        throw createError("Payment was modified by another request", 409);
      }

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
      const [stats] = await Payment.aggregate([{ $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } }, { $group: { _id: null, totalPayments: { $sum: 1 }, totalAmount: { $sum: '$amount' }, paidPayments: { $sum: { $cond: [{ $in: ['$status', ['paid','received']] }, 1, 0] } }, unpaidPayments: { $sum: { $cond: [{ $in: ['$status', ['unpaid','pending']] }, 1, 0] } }, overduePayments: { $sum: { $cond: [{ $and: [{ $in: ['$status', ['unpaid','pending']] }, { $lt: ['$dueDate', new Date()] }] }, 1, 0] } } } }]);

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
      const payments = await Payment.find({ userId }).select("personName");

      // Extract unique person names and sort them
      const uniqueNames = [
        ...new Set(payments.map((p) => p.personName)),
      ].sort();

      logger.info("Previous users retrieved", {
        userId,
        count: uniqueNames.length,
      });
      return await Payment.distinct("personName", { userId });
    } catch (error) {
      logger.error("Error retrieving previous users", { error, userId });
      throw error;
    }
  }
}

export const paymentService = new PaymentService();

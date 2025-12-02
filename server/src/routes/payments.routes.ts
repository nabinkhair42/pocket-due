import { Request, RequestHandler, Response, Router } from "express";
import { paymentService } from "../features/payments/payment-service";
import { authenticateToken } from "../middleware/auth";
import { CreatePaymentRequest, Payment, UpdatePaymentRequest } from "../types";
import { handleAsync } from "../utils/error-handler";
import {
  paymentValidationRules,
  updatePaymentValidationRules,
  validateRequest,
} from "../utils/validation";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as unknown as RequestHandler);

// Get all payments for user
router.get(
  "/",
  handleAsync(async (req: Request, res: Response) => {
    const userId = (req as unknown as { user: { _id: string } }).user._id;
    const payments = await paymentService.getPayments(userId);

    res.json({
      success: true,
      message: "Payments retrieved successfully",
      data: { payments },
    });
  })
);

// Get payments by type
router.get(
  "/type/:type",
  handleAsync(async (req: Request, res: Response) => {
    const { type } = req.params;
    const userId = (req as unknown as { user: { _id: string } }).user._id;

    if (!["to_pay", "to_receive"].includes(type)) {
      res.status(400).json({
        success: false,
        message: "Invalid payment type",
        error: "Type must be to_pay or to_receive",
      });
      return;
    }

    const payments = await paymentService.getPayments(userId, type);

    res.json({
      success: true,
      message: "Payments retrieved successfully",
      data: { payments },
    });
  })
);

// Get payment statistics
router.get(
  "/stats",
  handleAsync(async (req: Request, res: Response) => {
    const userId = (req as unknown as { user: { _id: string } }).user._id;
    const stats = await paymentService.getPaymentStats(userId);

    res.json({
      success: true,
      message: "Payment statistics retrieved successfully",
      data: { stats },
    });
  })
);

// Get previous users for dropdown
router.get(
  "/previous-users",
  authenticateToken as unknown as RequestHandler,
  handleAsync(async (req: Request, res: Response) => {
    const userId = (req as unknown as { user: { _id: string } }).user._id;
    const previousUsers = await paymentService.getPreviousUsers(userId);

    res.json({
      success: true,
      message: "Previous users retrieved successfully",
      data: { previousUsers },
    });
  })
);

// Create new payment
router.post(
  "/",
  validateRequest(paymentValidationRules),
  handleAsync(async (req: Request, res: Response) => {
    const { type, personName, description, amount, dueDate } =
      req.body as CreatePaymentRequest;
    const userId = (req as unknown as { user: { _id: string } }).user._id;

    const payment = await paymentService.createPayment(userId, {
      type,
      personName,
      description,
      amount,
      dueDate,
    });

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: { payment },
    });
  })
);

// Update payment
router.put(
  "/:id",
  validateRequest(updatePaymentValidationRules),
  handleAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as unknown as { user: { _id: string } }).user._id;
    const updateData = req.body as UpdatePaymentRequest;

    const payment = await paymentService.updatePayment(userId, id, updateData);

    res.json({
      success: true,
      message: "Payment updated successfully",
      data: { payment },
    });
  })
);

// Toggle payment status
router.patch(
  "/:id/toggle",
  handleAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as unknown as { user: { _id: string } }).user._id;

    const payment = await paymentService.togglePaymentStatus(userId, id);

    // If payment is null, it means it was deleted after being marked as paid/received
    if (payment === null) {
      res.json({
        success: true,
        message: "Payment completed and removed from list",
        data: { payment: null, deleted: true },
      });
    } else {
      res.json({
        success: true,
        message: "Payment status updated successfully",
        data: { payment, deleted: false },
      });
    }
  })
);

// Delete payment
router.delete(
  "/:id",
  handleAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = (req as unknown as { user: { _id: string } }).user._id;

    const payment = await paymentService.deletePayment(userId, id);

    res.json({
      success: true,
      message: "Payment deleted successfully",
      data: { payment },
    });
  })
);

// Get payment summaries grouped by person
router.get(
  "/summaries",
  authenticateToken as unknown as RequestHandler,
  async (req: Request, res: Response) => {
    try {
      const userId = (req.user as { id: string }).id;

      const payments = await paymentService.getPayments(userId);

      interface PaymentSummary {
        personName: string;
        toReceive: number;
        toPay: number;
        netTotal: number;
        payments: Array<{
          _id: string;
          type: "to_pay" | "to_receive";
          amount: number;
          description?: string;
          dueDate: Date;
          status: "paid" | "unpaid" | "received" | "pending";
          createdAt: Date;
        }>;
      }

      // Group payments by personName and calculate totals
      const summaries = payments.reduce(
        (acc: Record<string, PaymentSummary>, payment) => {
          const personName = payment.personName;

          if (!acc[personName]) {
            acc[personName] = {
              personName,
              toReceive: 0,
              toPay: 0,
              netTotal: 0,
              payments: [],
            };
          }

          if (payment.type === "to_receive") {
            acc[personName].toReceive += payment.amount;
          } else {
            acc[personName].toPay += payment.amount;
          }

          acc[personName].payments.push({
            _id: (payment as unknown as Payment)._id.toString(),
            type: payment.type,
            amount: payment.amount,
            description: payment.description,
            dueDate: payment.dueDate,
            status: payment.status,
            createdAt: payment.createdAt,
          });

          return acc;
        },
        {}
      );

      // Calculate net totals and sort by net total
      const summaryArray = Object.values(summaries)
        .map((summary) => {
          summary.netTotal = summary.toReceive - summary.toPay;
          return summary;
        })
        .sort((a, b) => Math.abs(b.netTotal) - Math.abs(a.netTotal));

      res.json({
        success: true,
        data: {
          summaries: summaryArray,
        },
      });
    } catch (error: unknown) {
      console.error("Error fetching payment summaries:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch payment summaries",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);

export default router;

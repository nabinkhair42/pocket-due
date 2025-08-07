import { Router, Request, Response, RequestHandler } from "express";
import { paymentService } from "../features/payments/paymentService";
import { authenticateToken } from "../middleware/auth";
import { CreatePaymentRequest, UpdatePaymentRequest } from "../types";
import {
  validateRequest,
  paymentValidationRules,
  updatePaymentValidationRules,
} from "../utils/validation";
import { handleAsync } from "../utils/errorHandler";
import { apiRateLimit } from "../middleware/rateLimit";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken as unknown as RequestHandler);

// Apply rate limiting to API routes
router.use(apiRateLimit.middleware);

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

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: { payment },
    });
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

export default router;

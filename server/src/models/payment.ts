import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  type: "to_pay" | "to_receive";
  personName: string;
  amount: number;
  dueDate: Date;
  description?: string;
  status: "paid" | "unpaid" | "received" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["to_pay", "to_receive"],
      required: true,
    },
    personName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "received", "pending"],
      required: true,
      default: function () {
        return this.type === "to_pay" ? "unpaid" : "pending";
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
paymentSchema.index({ userId: 1, type: 1, status: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

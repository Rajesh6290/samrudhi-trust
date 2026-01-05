import mongoose, { Schema, Document } from "mongoose";

export interface IPayout extends Document {
  payoutId: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  purpose: string;
  category:
    | "purchase"
    | "service"
    | "distribution"
    | "salary"
    | "labour"
    | "other";
  paymentMethod: "cash" | "upi" | "bank_transfer" | "cheque";
  transactionId?: string;
  qrData?: string;
  receiptUrl?: string;
  invoiceUrl?: string;
  status: "completed" | "pending";
  paidBy: mongoose.Types.ObjectId;
  paidAt?: Date;
  notes?: string;
  metadata?: {
    items?: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
    location?: string;
    [key: string]: string | number | boolean | undefined | Array<unknown>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>(
  {
    payoutId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientPhone: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "purchase",
        "service",
        "distribution",
        "salary",
        "labour",
        "other",
      ],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "bank_transfer", "cheque"],
      required: true,
    },
    transactionId: {
      type: String,
    },
    qrData: {
      type: String,
    },
    receiptUrl: {
      type: String,
    },
    invoiceUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["completed", "pending"],
      default: "completed",
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
// Note: payoutId index is automatically created by unique: true
PayoutSchema.index({ recipientName: 1, createdAt: -1 });
PayoutSchema.index({ status: 1, createdAt: -1 });
PayoutSchema.index({ qrData: 1 });
PayoutSchema.index({ category: 1, createdAt: -1 });

const Payout =
  mongoose.models.Payout || mongoose.model<IPayout>("Payout", PayoutSchema);

export default Payout;

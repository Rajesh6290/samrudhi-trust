import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  // Transaction type - incoming (payments) or outgoing (payouts)
  transactionType: "incoming" | "outgoing";

  // Common fields
  amount: number;
  transactionDate: Date;
  status: "pending" | "completed" | "failed" | "refunded" | "disputed";
  notes?: string;

  // Payment method
  paymentMethod?:
    | "card"
    | "netbanking"
    | "wallet"
    | "upi"
    | "cash"
    | "bank_transfer"
    | "cheque"
    | "other";

  // Invoice details
  invoiceNumber?: string;
  invoiceType?: "standard" | "80g";
  invoiceSent: boolean;
  invoiceSentDate?: Date;

  // ============ INCOMING TRANSACTION FIELDS (Payments/Donations) ============
  // Payment type (for incoming)
  paymentType?: "member" | "donation";

  // Member reference (optional - only for member payments)
  member?: mongoose.Types.ObjectId;
  month?: Date; // Only for member payments

  // Donor details (for non-member donations)
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorAddress?: string;

  // 80G Certificate details
  needs80G: boolean;
  panCard?: string;
  certificateNumber80G?: string;
  certificateIssueDate?: Date;

  // Razorpay details (for incoming)
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  razorpayResponse?: Record<string, unknown>;

  // Payment reconciliation
  reconciliationStatus:
    | "not_required"
    | "pending"
    | "reconciled"
    | "discrepancy";
  lastReconciliationDate?: Date;
  reconciliationNotes?: string;

  // Failure handling
  failureReason?: string;
  failureCode?: string;
  retryCount: number;
  maxRetries: number;

  // Refund tracking
  refundStatus?: "not_initiated" | "pending" | "processed" | "failed";
  refundAmount?: number;
  refundId?: string;
  refundReason?: string;
  refundDate?: Date;
  refundProcessedBy?: mongoose.Types.ObjectId;

  // Webhook tracking
  webhookReceived: boolean;
  webhookReceivedAt?: Date;
  webhookEventId?: string;

  // Payment retry tracking
  retryToken?: string;
  retryTokenExpiry?: Date;
  retryEmailSent?: boolean;
  retryEmailSentAt?: Date;

  // ============ OUTGOING TRANSACTION FIELDS (Payouts) ============
  // Payout ID
  payoutId?: string;

  // Recipient details
  recipientName?: string;
  recipientPhone?: string;

  // Payout specific
  purpose?: string;
  category?:
    | "purchase"
    | "service"
    | "distribution"
    | "salary"
    | "labour"
    | "other";

  transactionId?: string;
  qrData?: string;
  receiptUrl?: string;
  invoiceUrl?: string;

  paidBy?: mongoose.Types.ObjectId;
  paidAt?: Date;

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

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    // Transaction type
    transactionType: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: [true, "Transaction type is required"],
      index: true,
    },

    // Common fields
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "disputed"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "card",
        "netbanking",
        "wallet",
        "upi",
        "cash",
        "bank_transfer",
        "cheque",
        "other",
      ],
    },

    // Invoice details
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    invoiceType: {
      type: String,
      enum: ["standard", "80g"],
      default: "standard",
    },
    invoiceSent: {
      type: Boolean,
      default: false,
    },
    invoiceSentDate: {
      type: Date,
    },

    // ============ INCOMING FIELDS ============
    paymentType: {
      type: String,
      enum: ["member", "donation"],
      index: true,
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      index: true,
    },
    month: {
      type: Date,
      index: true,
    },
    donorName: {
      type: String,
      trim: true,
    },
    donorEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    donorPhone: {
      type: String,
      trim: true,
    },
    donorAddress: {
      type: String,
      trim: true,
    },
    needs80G: {
      type: Boolean,
      default: false,
      index: true,
    },
    panCard: {
      type: String,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format"],
    },
    certificateNumber80G: {
      type: String,
      sparse: true,
      index: true,
    },
    certificateIssueDate: {
      type: Date,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
    },
    razorpayResponse: {
      type: Schema.Types.Mixed,
    },
    reconciliationStatus: {
      type: String,
      enum: ["not_required", "pending", "reconciled", "discrepancy"],
      default: "not_required",
      index: true,
    },
    lastReconciliationDate: {
      type: Date,
    },
    reconciliationNotes: {
      type: String,
    },
    failureReason: {
      type: String,
    },
    failureCode: {
      type: String,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    maxRetries: {
      type: Number,
      default: 3,
    },
    refundStatus: {
      type: String,
      enum: ["not_initiated", "pending", "processed", "failed"],
    },
    refundAmount: {
      type: Number,
    },
    refundId: {
      type: String,
    },
    refundReason: {
      type: String,
    },
    refundDate: {
      type: Date,
    },
    refundProcessedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    webhookReceived: {
      type: Boolean,
      default: false,
    },
    webhookReceivedAt: {
      type: Date,
    },
    webhookEventId: {
      type: String,
    },

    // Payment retry fields
    retryToken: {
      type: String,
      sparse: true,
      index: true,
    },
    retryTokenExpiry: {
      type: Date,
    },
    retryEmailSent: {
      type: Boolean,
      default: false,
    },
    retryEmailSentAt: {
      type: Date,
    },

    // ============ OUTGOING FIELDS ============
    payoutId: {
      type: String,
      sparse: true,
      index: true,
      default() {
        if (this.transactionType === "outgoing") {
          return `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
      },
    },
    recipientName: {
      type: String,
      trim: true,
      index: true,
    },
    recipientPhone: {
      type: String,
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
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
      index: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    qrData: {
      type: String,
      index: true,
    },
    receiptUrl: {
      type: String,
    },
    invoiceUrl: {
      type: String,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    paidAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
TransactionSchema.index({ transactionType: 1, status: 1, transactionDate: -1 });
TransactionSchema.index({
  transactionType: 1,
  category: 1,
  transactionDate: -1,
});
TransactionSchema.index({ member: 1, month: 1 });
TransactionSchema.index({ recipientName: 1, transactionDate: -1 });

// Validation before save
TransactionSchema.pre("save", function () {
  // Validate incoming transactions
  if (this.transactionType === "incoming") {
    if (this.paymentType === "member") {
      if (!this.member) {
        throw new Error("Member is required for member payments");
      }
      if (!this.month) {
        throw new Error("Month is required for member payments");
      }
    } else if (this.paymentType === "donation") {
      if (!this.donorName) {
        throw new Error("Donor name is required for donations");
      }
      if (!this.donorEmail) {
        throw new Error("Donor email is required for donations");
      }
    }

    if (this.needs80G && !this.panCard) {
      throw new Error("PAN card is required for 80G certificate");
    }
  }

  // Validate outgoing transactions
  if (this.transactionType === "outgoing") {
    if (!this.recipientName) {
      throw new Error("Recipient name is required for outgoing transactions");
    }
    if (!this.purpose) {
      throw new Error("Purpose is required for outgoing transactions");
    }
    if (!this.category) {
      throw new Error("Category is required for outgoing transactions");
    }
    if (!this.paidBy) {
      throw new Error("PaidBy is required for outgoing transactions");
    }
  }
});

// Generate invoice number before saving
TransactionSchema.pre("save", async function () {
  if (this.status === "completed" && !this.invoiceNumber) {
    try {
      const count = await mongoose.models.Transaction.countDocuments({
        invoiceNumber: { $exists: true, $ne: null },
      });
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");

      if (this.transactionType === "incoming") {
        const prefix = this.needs80G ? "80G" : "INV";
        this.invoiceNumber = `${prefix}-${year}${month}-${String(count + 1).padStart(5, "0")}`;

        // Generate 80G certificate number if applicable
        if (this.needs80G && !this.certificateNumber80G) {
          const certCount = await mongoose.models.Transaction.countDocuments({
            certificateNumber80G: { $exists: true, $ne: null },
          });
          this.certificateNumber80G = `80G/${year}/${String(certCount + 1).padStart(5, "0")}`;
          this.certificateIssueDate = new Date();
          this.invoiceType = "80g";
        }
      } else if (this.transactionType === "outgoing") {
        this.invoiceNumber = `OUT-${year}${month}-${String(count + 1).padStart(5, "0")}`;
      }
    } catch (error) {
      console.error("Error generating invoice number:", error);
    }
  }
});

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;

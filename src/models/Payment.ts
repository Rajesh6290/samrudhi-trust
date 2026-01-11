import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  // Payment type
  paymentType: "member" | "donation";

  // Member reference (optional - only for member payments)
  member?: mongoose.Types.ObjectId;

  // Donor details (for non-member donations)
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  donorAddress?: string;

  // Payment details
  amount: number;
  month?: Date; // Only for member payments
  paymentDate: Date;
  status: "pending" | "completed" | "failed" | "refunded" | "disputed";

  // Payment reconciliation and tracking
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
  refundProcessedBy?: mongoose.Types.ObjectId; // Admin user who processed refund

  // 80G Certificate details
  needs80G: boolean;
  panCard?: string;
  certificateNumber80G?: string;
  certificateIssueDate?: Date;

  // Razorpay details
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentMethod?: string;
  razorpayResponse?: Record<string, any>; // Store complete Razorpay response for debugging

  // Invoice details
  invoiceNumber?: string;
  invoiceType?: "standard" | "80g";
  invoiceSent: boolean;
  invoiceSentDate?: Date;

  // Webhook tracking
  webhookReceived: boolean;
  webhookReceivedAt?: Date;
  webhookEventId?: string;

  // Payment retry tracking
  retryToken?: string;
  retryTokenExpiry?: Date;
  retryEmailSent?: boolean;
  retryEmailSentAt?: Date;

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    paymentType: {
      type: String,
      enum: ["member", "donation"],
      required: [true, "Payment type is required"],
      default: "donation",
      index: true,
    },
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      index: true,
      // Required only if paymentType is 'member'
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
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [200, "Minimum payment amount is ₹200"],
    },
    month: {
      type: Date,
      index: true,
      // Required only if paymentType is 'member'
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "disputed"],
      default: "pending",
      index: true,
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
    needs80G: {
      type: Boolean,
      default: false,
    },
    panCard: {
      type: String,
      uppercase: true,
      trim: true,
      // Validate PAN format if provided
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format"],
    },
    certificateNumber80G: {
      type: String,
      sparse: true,
    },
    certificateIssueDate: {
      type: Date,
    },
    razorpayOrderId: {
      type: String,
      sparse: true,
    },
    razorpayPaymentId: {
      type: String,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ["card", "netbanking", "wallet", "upi", "other"],
    },
    razorpayResponse: {
      type: Schema.Types.Mixed,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
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
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for member and month (for member payments)
PaymentSchema.index({ member: 1, month: 1 });

// Validation before save
PaymentSchema.pre("save", function () {
  if (this.paymentType === "member") {
    // Member payments require member and month
    if (!this.member) {
      throw new Error("Member is required for member payments");
    }
    if (!this.month) {
      throw new Error("Month is required for member payments");
    }
  } else if (this.paymentType === "donation") {
    // Donations require donor details
    if (!this.donorName) {
      throw new Error("Donor name is required for donations");
    }
    if (!this.donorEmail) {
      throw new Error("Donor email is required for donations");
    }
  }

  // If 80G is needed, PAN is required
  if (this.needs80G && !this.panCard) {
    throw new Error("PAN card is required for 80G certificate");
  }
});

// Generate invoice number before saving
PaymentSchema.pre("save", async function () {
  if (this.status === "completed" && !this.invoiceNumber) {
    try {
      const count = await mongoose.models.Payment.countDocuments({
        invoiceNumber: { $exists: true, $ne: null },
      });
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      const prefix = this.needs80G ? "80G" : "INV";
      this.invoiceNumber = `${prefix}-${year}${month}-${String(count + 1).padStart(5, "0")}`;

      // Generate 80G certificate number if applicable
      if (this.needs80G && !this.certificateNumber80G) {
        const certCount = await mongoose.models.Payment.countDocuments({
          certificateNumber80G: { $exists: true, $ne: null },
        });
        this.certificateNumber80G = `80G/${year}/${String(certCount + 1).padStart(5, "0")}`;
        this.certificateIssueDate = new Date();
        this.invoiceType = "80g";
      }
    } catch (error) {
      console.error("Error generating invoice number:", error);
    }
  }
});

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

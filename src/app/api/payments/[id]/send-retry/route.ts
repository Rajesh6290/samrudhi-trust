import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { sendImmediateRetryEmail } from "@/lib/sendImmediateRetryEmail";
import { verifyToken } from "@/lib/auth";
import { parse } from "cookie";

// Type for Payment document
interface PaymentDocument {
  _id: string;
  amount: number;
  donorEmail?: string;
  donorName?: string;
  paymentType?: string;
  member?: string;
  needs80G?: boolean;
  createdAt: Date;
  failureReason?: string;
  retryToken?: string;
  retryTokenExpiry?: Date;
  retryEmailSent?: boolean;
  retryEmailSentAt?: Date;
  save: () => Promise<void>;
}

export const dynamic = "force-dynamic";

/**
 * Send retry email for a pending/failed payment
 * POST /api/payments/[id]/send-retry
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Verify admin authentication
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Check if user has admin or superadmin role
    if (!["admin", "superadmin"].includes(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Find transaction
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Check if transaction is incoming and in a state that can receive retry emails
    if (transaction.transactionType !== "incoming") {
      return NextResponse.json(
        { error: "Only incoming transactions can receive retry emails" },
        { status: 400 }
      );
    }

    if (!["pending", "failed"].includes(transaction.status)) {
      return NextResponse.json(
        { error: "Transaction is not in a retryable state" },
        { status: 400 }
      );
    }

    // Send retry email
    try {
      const transactionObj = transaction.toObject();
      const paymentDoc: PaymentDocument = {
        ...transactionObj,
        _id: transaction._id.toString(),
        member: transactionObj.member?.toString(),
        retryToken: transactionObj.retryToken,
        retryTokenExpiry: transactionObj.retryTokenExpiry,
        save: async () => {
          // Copy retry token fields back to the actual transaction document
          if (paymentDoc.retryToken) {
            transaction.retryToken = paymentDoc.retryToken;
          }
          if (paymentDoc.retryTokenExpiry) {
            transaction.retryTokenExpiry = paymentDoc.retryTokenExpiry;
          }
          if (paymentDoc.retryEmailSent !== undefined) {
            transaction.retryEmailSent = paymentDoc.retryEmailSent;
          }
          if (paymentDoc.retryEmailSentAt) {
            transaction.retryEmailSentAt = paymentDoc.retryEmailSentAt;
          }
          await transaction.save();
        },
      };

      const emailSent = await sendImmediateRetryEmail(paymentDoc);

      if (!emailSent) {
        return NextResponse.json(
          { error: "Failed to send retry email - no email address found" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Retry email sent successfully",
        transaction,
      });
    } catch (emailError) {
      console.error("Failed to send retry email:", emailError);
      return NextResponse.json(
        {
          error: (emailError as Error).message || "Failed to send retry email",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending retry email:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to send retry email" },
      { status: 500 }
    );
  }
}

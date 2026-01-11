import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import { sendImmediateRetryEmail } from "@/lib/sendImmediateRetryEmail";

// Type for Payment document
interface PaymentDocument {
  _id: string;
  amount: number;
  donorEmail?: string;
  donorName?: string;
  paymentType: string;
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
 * Mark payment as cancelled and send retry email
 * PATCH /api/payments/[id]/mark-cancelled
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // Find payment
    const payment = await Payment.findById(id);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Only mark as cancelled if it's currently pending
    if (payment.status !== "pending") {
      return NextResponse.json(
        { error: "Payment is not in pending status" },
        { status: 400 }
      );
    }

    // Update payment status
    payment.status = "failed";
    payment.failureReason = reason || "User cancelled payment";
    payment.updatedAt = new Date();
    await payment.save();

    // Also update transaction if exists
    const transaction = await Transaction.findOne({
      razorpayOrderId: payment.razorpayOrderId,
    });
    if (transaction) {
      transaction.status = "failed";
      transaction.updatedAt = new Date();
      await transaction.save();
    }

    // Send retry email
    try {
      const paymentObj = payment.toObject();
      const paymentDoc: PaymentDocument = {
        ...paymentObj,
        _id: payment._id.toString(),
        member: paymentObj.member?.toString(),
        retryToken: paymentObj.retryToken,
        retryTokenExpiry: paymentObj.retryTokenExpiry,
        save: async () => {
          // Copy retry token fields back to the actual payment document
          if (paymentDoc.retryToken) {
            payment.retryToken = paymentDoc.retryToken;
          }
          if (paymentDoc.retryTokenExpiry) {
            payment.retryTokenExpiry = paymentDoc.retryTokenExpiry;
          }
          if (paymentDoc.retryEmailSent !== undefined) {
            payment.retryEmailSent = paymentDoc.retryEmailSent;
          }
          if (paymentDoc.retryEmailSentAt) {
            payment.retryEmailSentAt = paymentDoc.retryEmailSentAt;
          }
          await payment.save();
        },
      };
      await sendImmediateRetryEmail(paymentDoc);
    } catch (emailError) {
      console.error("Failed to send retry email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Payment marked as cancelled and retry email sent",
      payment,
    });
  } catch (error) {
    console.error("Error marking payment as cancelled:", error);
    return NextResponse.json(
      {
        error:
          (error as Error).message || "Failed to mark payment as cancelled",
      },
      { status: 500 }
    );
  }
}

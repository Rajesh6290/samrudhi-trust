import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { verifyToken } from "@/lib/auth";
import { sendPaymentRefundEmail } from "@/lib/emailHelpers";
import Member from "@/models/Member";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * Initiate refund for a payment
 * POST /api/razorpay/refund
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPayload = verifyToken(token);
    if (!userPayload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, refundAmount, refundReason, notes } = body;

    // Validate required fields
    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    // Find payment in database
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Validate payment status
    if (payment.status !== "completed" && payment.status !== "disputed") {
      return NextResponse.json(
        {
          error:
            "Can only refund completed or disputed payments. Current status: " +
            payment.status,
        },
        { status: 400 }
      );
    }

    // Check if already refunded
    if (payment.refundStatus === "processed") {
      return NextResponse.json(
        { error: "Payment has already been refunded" },
        { status: 400 }
      );
    }

    // Validate Razorpay payment ID
    if (!payment.razorpayPaymentId) {
      return NextResponse.json(
        {
          error:
            "No Razorpay payment ID found. Cannot process refund without payment ID.",
        },
        { status: 400 }
      );
    }

    // Validate refund amount
    const amountToRefund = refundAmount
      ? parseFloat(refundAmount)
      : payment.amount;

    if (amountToRefund > payment.amount) {
      return NextResponse.json(
        { error: "Refund amount cannot exceed original payment amount" },
        { status: 400 }
      );
    }

    if (amountToRefund <= 0) {
      return NextResponse.json(
        { error: "Refund amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
    });

    try {
      // Create refund in Razorpay
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: Math.round(amountToRefund * 100), // Convert to paise
        speed: "normal", // 'normal' or 'optimum'
        notes: {
          reason: refundReason || "Refund requested by admin",
          payment_id: payment._id.toString(),
          ...notes,
        },
        receipt: `refund_${payment._id}_${Date.now()}`,
      });

      // Update payment with refund details
      payment.refundStatus = "pending";
      payment.refundId = refund.id;
      payment.refundAmount = amountToRefund;
      payment.refundReason = refundReason || "Refund requested by admin";
      payment.refundProcessedBy =
        userPayload.userId as unknown as mongoose.Types.ObjectId;
      payment.reconciliationNotes = `Refund initiated: ${refundReason || "No reason provided"}`;

      // If full refund, update status
      if (amountToRefund === payment.amount) {
        payment.status = "refunded";
      }

      await payment.save();

      // Send refund email to member
      if (payment.donorEmail) {
        try {
          const member = await Member.findOne({ email: payment.donorEmail });
          await sendPaymentRefundEmail(
            member?.name || payment.donorName || "Donor",
            payment.donorEmail,
            refund.amount / 100,
            refund.id,
            refundReason || "Requested by donor"
          );
        } catch (emailError) {
          console.error("Failed to send refund email:", emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Refund initiated successfully",
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          created_at: refund.created_at,
        },
        payment,
      });
    } catch (razorpayError) {
      const errorMessage =
        razorpayError instanceof Error
          ? razorpayError.message
          : "Unknown error";
      console.error("Razorpay refund error:", razorpayError);

      // Update payment with refund failure
      payment.refundStatus = "failed";
      payment.refundReason = refundReason || "Refund requested by admin";
      payment.reconciliationNotes = `Refund failed: ${errorMessage}`;
      await payment.save();

      return NextResponse.json(
        {
          success: false,
          error: "Failed to process refund",
          details: errorMessage,
          payment,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Refund processing error:", error);
    return NextResponse.json(
      { error: errorMessage || "Refund processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Get refund status
 * GET /api/razorpay/refund?paymentId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPayload = verifyToken(token);
    if (!userPayload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");
    const refundId = searchParams.get("refundId");

    if (!paymentId && !refundId) {
      return NextResponse.json(
        { error: "Payment ID or Refund ID is required" },
        { status: 400 }
      );
    }

    let payment;

    if (paymentId) {
      // Find payment by ID
      payment = await Payment.findById(paymentId);
    } else if (refundId) {
      // Find payment by refund ID
      payment = await Payment.findOne({ refundId });
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // If refund exists, fetch latest status from Razorpay
    if (payment.refundId) {
      const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
      });

      try {
        const refund = await razorpay.refunds.fetch(payment.refundId);

        // Update refund status if changed
        if (
          refund.status === "processed" &&
          payment.refundStatus !== "processed"
        ) {
          payment.refundStatus = "processed";
          payment.refundDate = new Date(refund.created_at * 1000);
          if (payment.refundAmount === payment.amount) {
            payment.status = "refunded";
          }
          await payment.save();
        }

        return NextResponse.json({
          success: true,
          payment,
          refund: {
            id: refund.id,
            amount: refund.amount / 100,
            status: refund.status,
            created_at: refund.created_at,
            speed: refund.speed,
          },
        });
      } catch (razorpayError) {
        const errorMessage =
          razorpayError instanceof Error
            ? razorpayError.message
            : "Unknown error";
        console.error("Razorpay refund fetch error:", razorpayError);
        return NextResponse.json({
          success: false,
          payment,
          error: "Failed to fetch refund status from Razorpay",
          details: errorMessage,
        });
      }
    }

    return NextResponse.json({
      success: true,
      payment,
      message: "No refund initiated for this payment",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Refund status fetch error:", error);
    return NextResponse.json(
      { error: errorMessage || "Failed to fetch refund status" },
      { status: 500 }
    );
  }
}

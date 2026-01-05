import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { verifyToken } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * Verify payment with Razorpay and update local database
 * POST /api/razorpay/verify-payment
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      body;

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

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
    });

    // If Razorpay details provided, verify signature
    if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      const bodyToVerify = razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!)
        .update(bodyToVerify.toString())
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        // Signature verification failed
        payment.status = "failed";
        payment.failureReason = "Payment signature verification failed";
        payment.failureCode = "SIGNATURE_MISMATCH";
        payment.reconciliationStatus = "discrepancy";
        await payment.save();

        return NextResponse.json(
          {
            success: false,
            error: "Payment signature verification failed",
            payment,
          },
          { status: 400 }
        );
      }

      // Fetch payment details from Razorpay to verify
      try {
        const razorpayPayment =
          await razorpay.payments.fetch(razorpayPaymentId);

        // Check if payment is captured
        if (razorpayPayment.status === "captured") {
          payment.status = "completed";
          payment.razorpayPaymentId = razorpayPaymentId;
          payment.razorpayOrderId = razorpayOrderId;
          payment.razorpaySignature = razorpaySignature;
          payment.paymentMethod = razorpayPayment.method;
          payment.razorpayResponse = razorpayPayment;
          payment.reconciliationStatus = "reconciled";
          payment.lastReconciliationDate = new Date();
          payment.paymentDate = new Date(razorpayPayment.created_at * 1000);

          await payment.save();

          return NextResponse.json({
            success: true,
            message: "Payment verified and completed",
            payment,
          });
        } else if (razorpayPayment.status === "failed") {
          payment.status = "failed";
          payment.failureReason =
            (razorpayPayment.error_description as string) || "Payment failed";
          payment.failureCode = razorpayPayment.error_code as string;
          payment.razorpayResponse = razorpayPayment;
          payment.reconciliationStatus = "reconciled";
          payment.lastReconciliationDate = new Date();

          await payment.save();

          return NextResponse.json({
            success: false,
            message: "Payment verification failed - payment not captured",
            payment,
          });
        } else {
          // Payment is in pending or other status
          payment.reconciliationStatus = "pending";
          payment.lastReconciliationDate = new Date();
          payment.reconciliationNotes = `Payment status: ${razorpayPayment.status}`;
          payment.razorpayResponse = razorpayPayment;

          await payment.save();

          return NextResponse.json({
            success: false,
            message: `Payment is in ${razorpayPayment.status} status`,
            payment,
          });
        }
      } catch (razorpayError) {
        const errorMessage =
          razorpayError instanceof Error
            ? razorpayError.message
            : "Unknown error";
        console.error("Razorpay fetch error:", razorpayError);
        payment.reconciliationStatus = "discrepancy";
        payment.lastReconciliationDate = new Date();
        payment.reconciliationNotes = `Razorpay API error: ${errorMessage}`;
        await payment.save();

        return NextResponse.json(
          {
            success: false,
            error: "Failed to verify payment with Razorpay",
            details: errorMessage,
          },
          { status: 500 }
        );
      }
    } else {
      // No Razorpay details provided, fetch from Razorpay using order ID
      if (!payment.razorpayOrderId) {
        return NextResponse.json(
          {
            error:
              "No Razorpay order ID found. Cannot verify payment without order ID or payment details.",
          },
          { status: 400 }
        );
      }

      try {
        // Fetch order details from Razorpay
        const razorpayOrder = await razorpay.orders.fetch(
          payment.razorpayOrderId
        );

        if (razorpayOrder.status === "paid") {
          // Order is paid, fetch payment details
          const payments = await razorpay.orders.fetchPayments(
            payment.razorpayOrderId
          );

          if (payments.items && payments.items.length > 0) {
            const razorpayPayment = payments.items[0]; // Get the first payment

            if (razorpayPayment.status === "captured") {
              payment.status = "completed";
              payment.razorpayPaymentId = razorpayPayment.id;
              payment.paymentMethod = razorpayPayment.method;
              payment.razorpayResponse = razorpayPayment;
              payment.reconciliationStatus = "reconciled";
              payment.lastReconciliationDate = new Date();
              payment.paymentDate = new Date(razorpayPayment.created_at * 1000);

              await payment.save();

              return NextResponse.json({
                success: true,
                message: "Payment verified and completed",
                payment,
              });
            }
          }
        } else if (razorpayOrder.status === "attempted") {
          // Payment was attempted but not completed
          payment.reconciliationStatus = "discrepancy";
          payment.lastReconciliationDate = new Date();
          payment.reconciliationNotes =
            "Payment attempted but not completed. Money may be deducted but not captured.";

          await payment.save();

          return NextResponse.json({
            success: false,
            message:
              "Payment attempted but not completed. Please check with customer.",
            payment,
            requiresManualIntervention: true,
          });
        } else {
          // Order is not paid
          payment.reconciliationStatus = "pending";
          payment.lastReconciliationDate = new Date();
          payment.reconciliationNotes = `Order status: ${razorpayOrder.status}`;

          await payment.save();

          return NextResponse.json({
            success: false,
            message: `Order is in ${razorpayOrder.status} status`,
            payment,
          });
        }
      } catch (razorpayError) {
        const errorMessage =
          razorpayError instanceof Error
            ? razorpayError.message
            : "Unknown error";
        console.error("Razorpay fetch error:", razorpayError);
        payment.reconciliationStatus = "discrepancy";
        payment.lastReconciliationDate = new Date();
        payment.reconciliationNotes = `Razorpay API error: ${errorMessage}`;
        await payment.save();

        return NextResponse.json(
          {
            success: false,
            error: "Failed to verify payment with Razorpay",
            details: errorMessage,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: false,
      message: "Unable to verify payment",
      payment,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: errorMessage || "Payment verification failed" },
      { status: 500 }
    );
  }
}

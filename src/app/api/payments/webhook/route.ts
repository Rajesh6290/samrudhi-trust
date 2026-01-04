import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import WebhookLog from "@/models/WebhookLog";

export async function POST(req: NextRequest) {
  let webhookLog;

  try {
    await connectDB();

    // Get webhook signature from headers
    const signature = req.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");

      // Log failed webhook
      await WebhookLog.create({
        eventType: "unknown",
        payload: {},
        signature,
        status: "failed",
        errorMessage: "Invalid signature",
      });

      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse the webhook payload
    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log("Webhook received:", eventType);

    // Create webhook log
    webhookLog = await WebhookLog.create({
      eventType,
      payload: event,
      signature,
      status: "success",
    });

    // Handle different event types
    switch (eventType) {
      case "payment.captured":
        await handlePaymentCaptured(payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(payload.payment.entity);
        break;

      case "order.paid":
        await handleOrderPaid(payload.order.entity, payload.payment.entity);
        break;

      case "refund.created":
        await handleRefundCreated(payload.refund.entity);
        break;

      default:
        console.log("Unhandled event type:", eventType);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    const err = error as Error;
    console.error("Webhook error:", err);

    // Update webhook log with error
    if (webhookLog) {
      webhookLog.status = "failed";
      webhookLog.errorMessage = err.message;
      await webhookLog.save();
    }

    return NextResponse.json(
      { error: err.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Handle payment captured event
async function handlePaymentCaptured(paymentData: RazorpayPayment) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentData.order_id,
    });

    if (!payment) {
      console.error("Payment not found for order:", paymentData.order_id);
      return;
    }

    // Update payment status
    payment.status = "completed";
    payment.razorpayPaymentId = paymentData.id;
    payment.paymentDate = new Date(paymentData.created_at * 1000);
    payment.paymentMethod = paymentData.method || "other";

    await payment.save();

    console.log("Payment captured:", paymentData.id);
  } catch (error) {
    console.error("Error handling payment captured:", error);
  }
}

// Handle payment failed event
async function handlePaymentFailed(paymentData: RazorpayPayment) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: paymentData.order_id,
    });

    if (!payment) {
      console.error("Payment not found for order:", paymentData.order_id);
      return;
    }

    // Update payment status to failed
    payment.status = "failed";
    payment.notes = `Failed: ${paymentData.error_code} - ${paymentData.error_description}`;

    await payment.save();

    console.log("Payment failed:", paymentData.id);
  } catch (error) {
    console.error("Error handling payment failed:", error);
  }
}

// Handle order paid event
async function handleOrderPaid(
  orderData: RazorpayOrder,
  paymentData: RazorpayPayment
) {
  try {
    const payment = await Payment.findOne({
      razorpayOrderId: orderData.id,
    });

    if (!payment) {
      console.error("Payment not found for order:", orderData.id);
      return;
    }

    // Update payment with complete information
    payment.status = "completed";
    payment.razorpayPaymentId = paymentData.id;
    payment.paymentDate = new Date();
    payment.paymentMethod = paymentData.method || "other";

    await payment.save();

    console.log("Order paid:", orderData.id);
  } catch (error) {
    console.error("Error handling order paid:", error);
  }
}

// Handle refund created event
async function handleRefundCreated(refundData: RazorpayRefund) {
  try {
    const payment = await Payment.findOne({
      razorpayPaymentId: refundData.payment_id,
    });

    if (!payment) {
      console.error("Payment not found for refund:", refundData.payment_id);
      return;
    }

    // Update payment notes with refund information
    payment.notes = `${payment.notes || ""}\nRefund: ${refundData.id} - Amount: ₹${refundData.amount / 100}`;

    await payment.save();

    console.log("Refund created:", refundData.id);
  } catch (error) {
    console.error("Error handling refund created:", error);
  }
}

// Razorpay webhook types
interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  created_at: number;
  error_code?: string;
  error_description?: string;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpayRefund {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: string;
}

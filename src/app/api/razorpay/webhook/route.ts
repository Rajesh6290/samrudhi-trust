import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import WebhookLog from "@/models/WebhookLog";
import { sendImmediateRetryEmail } from "@/lib/sendImmediateRetryEmail";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

interface WebhookPayloadEntity {
  id: string;
  order_id?: string;
  payment_id?: string;
  amount: number;
  method?: string;
  status: string;
  created_at: number;
  error_code?: string;
  error_description?: string;
  [key: string]: unknown;
}

interface WebhookPayload {
  event: string;
  payment?: { entity: WebhookPayloadEntity };
  order?: { entity: WebhookPayloadEntity };
  refund?: { entity: WebhookPayloadEntity };
}

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
    return expectedSignature === signature;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payload: WebhookPayload) {
  const paymentEntity = payload.payment?.entity;
  if (!paymentEntity) throw new Error("Payment entity not found in payload");

  const paymentId = paymentEntity.id;
  const orderId = paymentEntity.order_id;
  if (!orderId) throw new Error("Order ID not found in payment entity");

  // Find payment by Razorpay order ID
  const payment = await Payment.findOne({ razorpayOrderId: orderId });

  if (!payment) {
    throw new Error(`Payment not found for order ID: ${orderId}`);
  }

  // Update payment status
  payment.status = "completed";
  payment.razorpayPaymentId = paymentId;
  payment.paymentMethod = paymentEntity.method;
  payment.razorpayResponse = paymentEntity;
  payment.webhookReceived = true;
  payment.webhookReceivedAt = new Date();
  payment.webhookEventId = payload.event;
  payment.reconciliationStatus = "reconciled";
  payment.lastReconciliationDate = new Date();
  payment.paymentDate = new Date(paymentEntity.created_at * 1000);

  await payment.save();

  // TODO: Send invoice email to donor/member
  // TODO: If 80G is needed, generate certificate

  return {
    success: true,
    message: "Payment captured successfully",
    paymentId: payment._id,
  };
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payload: WebhookPayload) {
  const paymentEntity = payload.payment?.entity;
  if (!paymentEntity) throw new Error("Payment entity not found in payload");
  const orderId = paymentEntity.order_id;
  const errorCode = paymentEntity.error_code;
  const errorDescription = paymentEntity.error_description;

  // Find payment by Razorpay order ID
  const payment = await Payment.findOne({ razorpayOrderId: orderId });

  if (!payment) {
    throw new Error(`Payment not found for order ID: ${orderId}`);
  }

  // Update payment status
  payment.status = "failed";
  payment.failureCode = errorCode;
  payment.failureReason = errorDescription;
  payment.razorpayResponse = paymentEntity;
  payment.webhookReceived = true;
  payment.webhookReceivedAt = new Date();
  payment.webhookEventId = payload.event;
  payment.reconciliationStatus = "reconciled";
  payment.lastReconciliationDate = new Date();

  await payment.save();

  // Send immediate retry email
  try {
    await sendImmediateRetryEmail(payment);
  } catch (emailError) {
    console.error("Failed to send immediate retry email:", emailError);
  }

  // TODO: Send failure notification email to donor/member
  // TODO: If retryCount < maxRetries, send retry link

  return {
    success: true,
    message: "Payment failure recorded",
    paymentId: payment._id,
  };
}

/**
 * Handle refund.processed event
 */
async function handleRefundProcessed(payload: WebhookPayload) {
  const refundEntity = payload.refund?.entity;
  if (!refundEntity) throw new Error("Refund entity not found in payload");
  const paymentId = refundEntity.payment_id;
  const refundId = refundEntity.id;
  const refundAmount = refundEntity.amount / 100; // Convert paise to rupees

  // Find payment by Razorpay payment ID
  const payment = await Payment.findOne({ razorpayPaymentId: paymentId });

  if (!payment) {
    throw new Error(`Payment not found for payment ID: ${paymentId}`);
  }

  // Update payment with refund details
  payment.status = "refunded";
  payment.refundStatus = "processed";
  payment.refundId = refundId;
  payment.refundAmount = refundAmount;
  payment.refundDate = new Date(refundEntity.created_at * 1000);
  payment.webhookReceived = true;
  payment.webhookReceivedAt = new Date();
  payment.webhookEventId = payload.event;

  await payment.save();

  // TODO: Send refund confirmation email to donor/member

  return {
    success: true,
    message: "Refund processed successfully",
    paymentId: payment._id,
  };
}

/**
 * Handle order.paid event (backup for payment.captured)
 */
async function handleOrderPaid(payload: WebhookPayload) {
  const orderEntity = payload.order?.entity;
  if (!orderEntity) throw new Error("Order entity not found in payload");
  const orderId = orderEntity.id;

  // Find payment by Razorpay order ID
  const payment = await Payment.findOne({ razorpayOrderId: orderId });

  if (!payment) {
    throw new Error(`Payment not found for order ID: ${orderId}`);
  }

  // Only update if not already completed
  if (payment.status === "pending") {
    payment.status = "completed";
    payment.webhookReceived = true;
    payment.webhookReceivedAt = new Date();
    payment.webhookEventId = payload.event;
    payment.reconciliationStatus = "pending"; // Mark for manual reconciliation

    await payment.save();
  }

  return {
    success: true,
    message: "Order paid event processed",
    paymentId: payment._id,
  };
}

/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  let eventType = "unknown";

  try {
    await connectDB();

    // Get webhook secret from environment
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook configuration error" },
        { status: 500 }
      );
    }

    // Get signature from headers
    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing webhook signature" },
        { status: 400 }
      );
    }

    // Get raw body
    const body = await request.text();
    const payload = JSON.parse(body) as WebhookPayload;
    eventType = payload.event || "unknown";

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      // Log failed webhook attempt
      await WebhookLog.create({
        eventType: payload.event || "unknown",
        payload: payload as unknown as Record<string, unknown>,
        signature,
        status: "failed",
        errorMessage: "Invalid webhook signature",
      });
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    // Process webhook based on event type
    let result;

    switch (eventType) {
      case "payment.captured":
        result = await handlePaymentCaptured(payload);
        break;

      case "payment.failed":
        result = await handlePaymentFailed(payload);
        break;

      case "refund.processed":
        result = await handleRefundProcessed(payload);
        break;

      case "order.paid":
        result = await handleOrderPaid(payload);
        break;

      default:
        // Unhandled webhook event - log for debugging if needed
        result = { success: true, message: "Event ignored" };
    }

    // Log successful webhook
    await WebhookLog.create({
      eventType,
      payload: payload as unknown as Record<string, unknown>,
      signature,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook processing error:", error);

    // Log failed webhook
    try {
      await WebhookLog.create({
        eventType,
        payload: JSON.parse(await request.clone().text()) as Record<
          string,
          unknown
        >,
        signature: request.headers.get("x-razorpay-signature") || "",
        status: "failed",
        errorMessage,
      });
    } catch (logError) {
      console.error("Error logging webhook failure:", logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage || "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}

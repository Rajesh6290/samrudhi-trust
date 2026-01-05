import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Payment, { IPayment } from "@/models/Payment";

/**
 * Payment Reconciliation Service
 * Handles automatic reconciliation of pending and discrepant payments
 */

interface ReconciliationDetail {
  paymentId: string;
  orderId?: string;
  status: string;
  message: string;
  amount?: number;
  donorEmail?: string;
  donorName?: string;
}

interface ReconciliationResult {
  totalProcessed: number;
  reconciled: number;
  discrepancies: number;
  failed: number;
  details: ReconciliationDetail[];
}

/**
 * Reconcile a single payment with Razorpay
 */
async function reconcileSinglePayment(
  payment: IPayment,
  razorpay: Razorpay
): Promise<{ status: string; message: string; payment: IPayment }> {
  try {
    // Skip if no order ID
    if (!payment.razorpayOrderId) {
      return {
        status: "failed",
        message: "No Razorpay order ID found",
        payment,
      };
    }

    // Fetch order from Razorpay
    const razorpayOrder = await razorpay.orders.fetch(payment.razorpayOrderId);

    if (razorpayOrder.status === "paid") {
      // Order is paid, fetch payment details
      const payments = await razorpay.orders.fetchPayments(
        payment.razorpayOrderId
      );

      if (payments.items && payments.items.length > 0) {
        const razorpayPayment = payments.items[0];

        if (razorpayPayment.status === "captured") {
          // Update payment to completed
          payment.status = "completed";
          payment.razorpayPaymentId = razorpayPayment.id;
          payment.paymentMethod = razorpayPayment.method;
          payment.razorpayResponse = razorpayPayment;
          payment.reconciliationStatus = "reconciled";
          payment.lastReconciliationDate = new Date();
          payment.paymentDate = new Date(razorpayPayment.created_at * 1000);

          await payment.save();

          return {
            status: "reconciled",
            message: "Payment reconciled as completed",
            payment,
          };
        } else if (razorpayPayment.status === "failed") {
          // Update payment to failed
          payment.status = "failed";
          payment.failureReason =
            razorpayPayment.error_description || "Payment failed";
          payment.failureCode = razorpayPayment.error_code;
          payment.razorpayResponse = razorpayPayment;
          payment.reconciliationStatus = "reconciled";
          payment.lastReconciliationDate = new Date();

          await payment.save();

          return {
            status: "reconciled",
            message: "Payment reconciled as failed",
            payment,
          };
        }
      }
    } else if (razorpayOrder.status === "attempted") {
      // Payment was attempted but not completed - CRITICAL CASE
      payment.reconciliationStatus = "discrepancy";
      payment.lastReconciliationDate = new Date();
      payment.reconciliationNotes =
        "Payment attempted but not completed. Money may be deducted but not captured. Requires manual intervention.";

      await payment.save();

      return {
        status: "discrepancy",
        message:
          "Payment attempted but not completed - requires manual intervention",
        payment,
      };
    } else if (razorpayOrder.status === "created") {
      // Order created but payment not attempted
      payment.reconciliationStatus = "pending";
      payment.lastReconciliationDate = new Date();
      payment.reconciliationNotes = "Order created but payment not attempted";

      await payment.save();

      return {
        status: "pending",
        message: "Order created but payment not attempted",
        payment,
      };
    }

    // Unknown status
    payment.reconciliationStatus = "discrepancy";
    payment.lastReconciliationDate = new Date();
    payment.reconciliationNotes = `Unknown order status: ${razorpayOrder.status}`;

    await payment.save();

    return {
      status: "discrepancy",
      message: `Unknown order status: ${razorpayOrder.status}`,
      payment,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error reconciling payment:", error);

    payment.reconciliationStatus = "discrepancy";
    payment.lastReconciliationDate = new Date();
    payment.reconciliationNotes = `Reconciliation error: ${errorMessage}`;
    await payment.save();

    return {
      status: "failed",
      message: `Reconciliation error: ${errorMessage}`,
      payment,
    };
  }
}

/**
 * Reconcile all pending payments
 */
export async function reconcilePendingPayments(): Promise<ReconciliationResult> {
  await connectDB();

  const result: ReconciliationResult = {
    totalProcessed: 0,
    reconciled: 0,
    discrepancies: 0,
    failed: 0,
    details: [],
  };

  try {
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
    });

    // Find all pending payments older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const pendingPayments = await Payment.find({
      status: "pending",
      createdAt: { $lt: tenMinutesAgo },
      razorpayOrderId: { $exists: true },
    }).limit(50); // Process in batches

    result.totalProcessed = pendingPayments.length;

    // Process each payment
    for (const payment of pendingPayments) {
      const reconciliationResult = await reconcileSinglePayment(
        payment,
        razorpay
      );

      if (reconciliationResult.status === "reconciled") {
        result.reconciled++;
      } else if (reconciliationResult.status === "discrepancy") {
        result.discrepancies++;
      } else {
        result.failed++;
      }

      result.details.push({
        paymentId: payment._id.toString(),
        orderId: payment.razorpayOrderId,
        status: reconciliationResult.status,
        message: reconciliationResult.message,
      });

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return result;
  } catch (error) {
    console.error("Error in reconciliation process:", error);
    throw error;
  }
}

/**
 * Reconcile payments with discrepancies
 */
export async function reconcileDiscrepantPayments(): Promise<ReconciliationResult> {
  await connectDB();

  const result: ReconciliationResult = {
    totalProcessed: 0,
    reconciled: 0,
    discrepancies: 0,
    failed: 0,
    details: [],
  };

  try {
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
    });

    // Find all payments with discrepancies
    const discrepantPayments = await Payment.find({
      reconciliationStatus: "discrepancy",
      razorpayOrderId: { $exists: true },
    }).limit(50);

    result.totalProcessed = discrepantPayments.length;

    // Process each payment
    for (const payment of discrepantPayments) {
      const reconciliationResult = await reconcileSinglePayment(
        payment,
        razorpay
      );

      if (reconciliationResult.status === "reconciled") {
        result.reconciled++;
      } else if (reconciliationResult.status === "discrepancy") {
        result.discrepancies++;
      } else {
        result.failed++;
      }

      result.details.push({
        paymentId: payment._id.toString(),
        orderId: payment.razorpayOrderId,
        status: reconciliationResult.status,
        message: reconciliationResult.message,
      });

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return result;
  } catch (error) {
    console.error("Error in discrepancy reconciliation:", error);
    throw error;
  }
}

/**
 * Check for stuck payments (money deducted but not received)
 * These are payments where order status is 'attempted' - critical cases
 */
export async function checkStuckPayments(): Promise<ReconciliationResult> {
  await connectDB();

  const result: ReconciliationResult = {
    totalProcessed: 0,
    reconciled: 0,
    discrepancies: 0,
    failed: 0,
    details: [],
  };

  try {
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
    });

    // Find payments that are pending or have discrepancies
    const paymentsToCheck = await Payment.find({
      $or: [
        { status: "pending" },
        { reconciliationStatus: { $in: ["pending", "discrepancy"] } },
      ],
      razorpayOrderId: { $exists: true },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    });

    result.totalProcessed = paymentsToCheck.length;

    for (const payment of paymentsToCheck) {
      try {
        if (!payment.razorpayOrderId) continue;

        const razorpayOrder = await razorpay.orders.fetch(
          payment.razorpayOrderId
        );

        if (razorpayOrder.status === "attempted") {
          // CRITICAL: Payment attempted but not captured
          payment.reconciliationStatus = "discrepancy";
          payment.lastReconciliationDate = new Date();
          payment.reconciliationNotes =
            "CRITICAL: Payment attempted. Money may be deducted from customer account but not captured. Requires immediate manual verification and potential refund.";
          payment.status = "disputed";

          await payment.save();

          result.discrepancies++;
          result.details.push({
            paymentId: payment._id.toString(),
            orderId: payment.razorpayOrderId,
            status: "CRITICAL",
            message:
              "Payment attempted - money may be stuck. Requires manual intervention.",
            amount: payment.amount,
            donorEmail: payment.donorEmail,
            donorName: payment.donorName,
          });
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`Error checking payment ${payment._id}:`, errorMessage);
        result.failed++;
      }
    }

    return result;
  } catch (error) {
    console.error("Error checking stuck payments:", error);
    throw error;
  }
}

/**
 * Send alert for payments requiring manual intervention
 */
export async function getPaymentsRequiringIntervention() {
  await connectDB();

  const criticalPayments = await Payment.find({
    $or: [
      { status: "disputed" },
      { reconciliationStatus: "discrepancy" },
      {
        status: "pending",
        createdAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) }, // Older than 1 hour
      },
    ],
  })
    .populate("member", "name email phone")
    .sort({ createdAt: -1 })
    .limit(100);

  return criticalPayments;
}

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";

/**
 * API endpoint to mark old pending payments as failed/expired
 * This handles cases where payments were initiated but cancelled or abandoned
 *
 * Payments pending for more than 24 hours are considered expired
 */
export async function POST() {
  try {
    await connectDB();

    // Calculate the cutoff time (24 hours ago)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);

    // Find and update old pending payments in Payment collection
    const expiredPayments = await Payment.updateMany(
      {
        status: "pending",
        createdAt: { $lt: cutoffTime },
      },
      {
        $set: {
          status: "failed",
          failureReason: "Payment expired - not completed within 24 hours",
          failureCode: "PAYMENT_EXPIRED",
          notes: "Automatically marked as failed due to timeout",
        },
      }
    );

    // Find and update old pending transactions in Transaction collection
    const expiredTransactions = await Transaction.updateMany(
      {
        status: "pending",
        transactionType: "incoming",
        createdAt: { $lt: cutoffTime },
      },
      {
        $set: {
          status: "failed",
          failureReason: "Payment expired - not completed within 24 hours",
          failureCode: "PAYMENT_EXPIRED",
          notes: "Automatically marked as failed due to timeout",
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Pending payments cleanup completed",
      expiredPaymentsCount: expiredPayments.modifiedCount,
      expiredTransactionsCount: expiredTransactions.modifiedCount,
    });
  } catch (error) {
    console.error("Error cleaning up pending payments:", error);
    return NextResponse.json(
      {
        error: (error as Error).message || "Failed to cleanup pending payments",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check how many pending payments would be affected
 */
export async function GET() {
  try {
    await connectDB();

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - 24);

    const pendingPaymentsCount = await Payment.countDocuments({
      status: "pending",
      createdAt: { $lt: cutoffTime },
    });

    const pendingTransactionsCount = await Transaction.countDocuments({
      status: "pending",
      transactionType: "incoming",
      createdAt: { $lt: cutoffTime },
    });

    const recentPendingPayments = await Payment.countDocuments({
      status: "pending",
      createdAt: { $gte: cutoffTime },
    });

    const recentPendingTransactions = await Transaction.countDocuments({
      status: "pending",
      transactionType: "incoming",
      createdAt: { $gte: cutoffTime },
    });

    return NextResponse.json({
      success: true,
      expiredPendingPayments: pendingPaymentsCount,
      expiredPendingTransactions: pendingTransactionsCount,
      recentPendingPayments,
      recentPendingTransactions,
      cutoffTime: cutoffTime.toISOString(),
    });
  } catch (error) {
    console.error("Error checking pending payments:", error);
    return NextResponse.json(
      {
        error: (error as Error).message || "Failed to check pending payments",
      },
      { status: 500 }
    );
  }
}

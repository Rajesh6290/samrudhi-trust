import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { verifyToken } from "@/lib/auth";
import {
  reconcilePendingPayments,
  reconcileDiscrepantPayments,
  checkStuckPayments,
  getPaymentsRequiringIntervention,
} from "@/lib/paymentReconciliation";

// Force dynamic rendering
export const dynamic = "force-dynamic";

/**
 * Get payments requiring manual intervention
 * GET /api/admin/payments/reconciliation
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication and admin access
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "pending") {
      // Get all pending payments requiring intervention
      const payments = await getPaymentsRequiringIntervention();
      return NextResponse.json({
        success: true,
        count: payments.length,
        payments,
      });
    } else if (action === "stats") {
      // Get reconciliation statistics
      const [
        totalPayments,
        pendingPayments,
        discrepantPayments,
        disputedPayments,
        refundedPayments,
      ] = await Promise.all([
        Payment.countDocuments(),
        Payment.countDocuments({ status: "pending" }),
        Payment.countDocuments({ reconciliationStatus: "discrepancy" }),
        Payment.countDocuments({ status: "disputed" }),
        Payment.countDocuments({ status: "refunded" }),
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          total: totalPayments,
          pending: pendingPayments,
          discrepant: discrepantPayments,
          disputed: disputedPayments,
          refunded: refundedPayments,
        },
      });
    }

    // Default: get payments requiring intervention
    const payments = await getPaymentsRequiringIntervention();
    return NextResponse.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error: any) {
    console.error("Error fetching reconciliation data:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reconciliation data" },
      { status: 500 }
    );
  }
}

/**
 * Trigger payment reconciliation
 * POST /api/admin/payments/reconciliation
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication and admin access
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, paymentId } = body;

    if (action === "reconcile-pending") {
      // Reconcile all pending payments
      const result = await reconcilePendingPayments();
      return NextResponse.json({
        success: true,
        message: "Pending payments reconciliation completed",
        result,
      });
    } else if (action === "reconcile-discrepant") {
      // Reconcile payments with discrepancies
      const result = await reconcileDiscrepantPayments();
      return NextResponse.json({
        success: true,
        message: "Discrepant payments reconciliation completed",
        result,
      });
    } else if (action === "check-stuck") {
      // Check for stuck payments
      const result = await checkStuckPayments();
      return NextResponse.json({
        success: true,
        message: "Stuck payments check completed",
        result,
      });
    } else if (action === "mark-completed" && paymentId) {
      // Manually mark payment as completed (after verification)
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      payment.status = "completed";
      payment.reconciliationStatus = "reconciled";
      payment.lastReconciliationDate = new Date();
      payment.reconciliationNotes = `Manually marked as completed by admin (${payload.userId})`;

      await payment.save();

      return NextResponse.json({
        success: true,
        message: "Payment marked as completed",
        payment,
      });
    } else if (action === "mark-failed" && paymentId) {
      // Manually mark payment as failed (after verification)
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      payment.status = "failed";
      payment.reconciliationStatus = "reconciled";
      payment.lastReconciliationDate = new Date();
      payment.reconciliationNotes = `Manually marked as failed by admin (${payload.userId})`;

      await payment.save();

      return NextResponse.json({
        success: true,
        message: "Payment marked as failed",
        payment,
      });
    } else if (action === "mark-disputed" && paymentId) {
      // Mark payment as disputed
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return NextResponse.json(
          { error: "Payment not found" },
          { status: 404 }
        );
      }

      payment.status = "disputed";
      payment.reconciliationStatus = "discrepancy";
      payment.lastReconciliationDate = new Date();
      payment.reconciliationNotes = `Marked as disputed by admin (${payload.userId}). Requires investigation.`;

      await payment.save();

      return NextResponse.json({
        success: true,
        message: "Payment marked as disputed",
        payment,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action or missing parameters" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error in reconciliation action:", error);
    return NextResponse.json(
      { error: error.message || "Reconciliation action failed" },
      { status: 500 }
    );
  }
}

/**
 * Update payment reconciliation notes
 * PATCH /api/admin/payments/reconciliation
 */
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication and admin access
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, reconciliationNotes } = body;

    if (!paymentId || !reconciliationNotes) {
      return NextResponse.json(
        { error: "Payment ID and reconciliation notes are required" },
        { status: 400 }
      );
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Update reconciliation notes
    const timestamp = new Date().toISOString();
    const existingNotes = payment.reconciliationNotes || "";
    payment.reconciliationNotes = `${existingNotes}\n[${timestamp}] Admin (${payload.userId}): ${reconciliationNotes}`;
    payment.lastReconciliationDate = new Date();

    await payment.save();

    return NextResponse.json({
      success: true,
      message: "Reconciliation notes updated",
      payment,
    });
  } catch (error: any) {
    console.error("Error updating reconciliation notes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update reconciliation notes" },
      { status: 500 }
    );
  }
}

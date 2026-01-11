import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    const month = searchParams.get("month");
    const status = searchParams.get("status");
    const paymentType = searchParams.get("paymentType");
    const needs80G = searchParams.get("needs80G");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const useNewSystem = searchParams.get("useNew") === "true";

    const query: any = {};

    if (memberId) {
      query.member = memberId;
    }

    if (month) {
      const monthDate = new Date(month);
      const startOfMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0
      );
      query.month = { $gte: startOfMonth, $lte: endOfMonth };
    }

    if (status) {
      query.status = status;
    }

    if (paymentType) {
      query.paymentType = paymentType;
    }

    if (needs80G === "true") {
      query.needs80G = true;
    }

    const skip = (page - 1) * limit;

    // Use Transaction collection if requested, otherwise use Payment (backward compatibility)
    let payments, total;

    if (useNewSystem) {
      // Use new Transaction collection
      const transactionQuery = {
        ...query,
        transactionType: "incoming",
      };

      [payments, total] = await Promise.all([
        Transaction.find(transactionQuery)
          .populate("member", "name email phone")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Transaction.countDocuments(transactionQuery),
      ]);

      // Map transaction fields to payment format for backward compatibility
      payments = payments.map((t: any) => ({
        _id: t._id,
        paymentType: t.paymentType,
        member: t.member,
        donorName: t.donorName,
        donorEmail: t.donorEmail,
        donorPhone: t.donorPhone,
        amount: t.amount,
        month: t.month,
        paymentDate: t.transactionDate,
        status: t.status,
        invoiceNumber: t.invoiceNumber,
        paymentMethod: t.paymentMethod,
        razorpayPaymentId: t.razorpayPaymentId,
        needs80G: t.needs80G,
        certificateNumber80G: t.certificateNumber80G,
        panCard: t.panCard,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }));
    } else {
      // Use old Payment collection (default for backward compatibility)
      [payments, total] = await Promise.all([
        Payment.find(query)
          .populate("member", "name email phone")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Payment.countDocuments(query),
      ]);
    }

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

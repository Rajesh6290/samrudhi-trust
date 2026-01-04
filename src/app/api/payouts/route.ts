import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payout from "@/models/Payout";
import { requireAuth } from "@/lib/auth-middleware";

// GET - Fetch all payouts with filters
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    await dbConnect();

    // Build query
    const query: Record<string, unknown> = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.createdAt = {} as Record<string, Date>;
      if (startDate)
        (query.createdAt as Record<string, Date>).$gte = new Date(startDate);
      if (endDate)
        (query.createdAt as Record<string, Date>).$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      Payout.find(query)
        .populate("paidBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payout.countDocuments(query),
    ]);

    // Calculate totals
    const totals = await Payout.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalPayouts: { $sum: 1 },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      payouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      totals: totals[0] || { totalAmount: 0, totalPayouts: 0 },
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST - Create new payout
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    const body = await request.json();
    const {
      recipientName,
      recipientPhone,
      qrData,
      amount,
      purpose,
      category,
      paymentMethod,
      transactionId,
      receiptUrl,
      invoiceUrl,
      notes,
      metadata,
    } = body;

    await dbConnect();

    // Create payout
    const payout = await Payout.create({
      recipientName,
      recipientPhone,
      amount,
      purpose,
      category,
      paymentMethod,
      transactionId,
      qrData,
      receiptUrl,
      invoiceUrl,
      notes,
      metadata,
      paidBy: authResult.user._id,
      status: "completed",
      paidAt: new Date(),
    });

    return NextResponse.json({ success: true, payout }, { status: 201 });
  } catch (error) {
    console.error("Error creating payout:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

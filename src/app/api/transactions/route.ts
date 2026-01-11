import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import { requireAuth } from "@/lib/auth-middleware";

// GET - Fetch transactions with comprehensive analytics
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const transactionType = searchParams.get("transactionType"); // incoming | outgoing
    const paymentType = searchParams.get("paymentType"); // member | donation
    const category = searchParams.get("category"); // for outgoing
    const status = searchParams.get("status");
    const needs80G = searchParams.get("needs80G");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const memberId = searchParams.get("memberId");
    const month = searchParams.get("month");
    const period = searchParams.get("period"); // year | month | week
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: Record<string, unknown> = {};

    if (transactionType) query.transactionType = transactionType;
    if (paymentType) query.paymentType = paymentType;
    if (category) query.category = category;
    if (status) query.status = status;
    if (needs80G === "true") query.needs80G = true;
    if (memberId) query.member = memberId;

    // Date range filter
    if (startDate || endDate) {
      query.transactionDate = {} as Record<string, Date>;
      if (startDate)
        (query.transactionDate as Record<string, Date>).$gte = new Date(
          startDate
        );
      if (endDate)
        (query.transactionDate as Record<string, Date>).$lte = new Date(
          endDate
        );
    }

    // Month filter for member payments
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

    const skip = (page - 1) * limit;

    // Fetch transactions with pagination
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate("member", "name email phone")
        .populate("paidBy", "name email")
        .populate("refundProcessedBy", "name email")
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(query),
    ]);

    // ============ COMPREHENSIVE ANALYTICS ============

    // Overall totals
    const overallStats = await Transaction.aggregate([
      {
        $group: {
          _id: "$transactionType",
          totalAmount: { $sum: "$amount" },
          totalCount: { $sum: 1 },
          completedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
            },
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const incomingStats = overallStats.find((s) => s._id === "incoming") || {
      totalAmount: 0,
      totalCount: 0,
      completedAmount: 0,
      completedCount: 0,
    };

    const outgoingStats = overallStats.find((s) => s._id === "outgoing") || {
      totalAmount: 0,
      totalCount: 0,
      completedAmount: 0,
      completedCount: 0,
    };

    // Status breakdown
    const statusBreakdown = await Transaction.aggregate([
      {
        $group: {
          _id: {
            type: "$transactionType",
            status: "$status",
          },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    // Period-based analytics (Year, Month, Week)
    let periodStats = null;
    if (period) {
      const now = new Date();
      let periodStart: Date;

      switch (period) {
        case "year":
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        case "month":
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "week":
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - 7);
          break;
        default:
          periodStart = new Date(now.getFullYear(), 0, 1);
      }

      periodStats = await Transaction.aggregate([
        {
          $match: {
            transactionDate: { $gte: periodStart },
            status: "completed",
          },
        },
        {
          $group: {
            _id: "$transactionType",
            totalAmount: { $sum: "$amount" },
            totalCount: { $sum: 1 },
            averageAmount: { $avg: "$amount" },
          },
        },
      ]);
    }

    // Category breakdown for outgoing
    const categoryBreakdown = await Transaction.aggregate([
      {
        $match: {
          transactionType: "outgoing",
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    // Payment type breakdown for incoming
    const paymentTypeBreakdown = await Transaction.aggregate([
      {
        $match: {
          transactionType: "incoming",
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$paymentType",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // 80G certificates count
    const cert80GCount = await Transaction.countDocuments({
      transactionType: "incoming",
      needs80G: true,
      certificateNumber80G: { $exists: true, $ne: null },
      status: "completed",
    });

    // Monthly trend (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyTrend = await Transaction.aggregate([
      {
        $match: {
          transactionDate: { $gte: twelveMonthsAgo },
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            type: "$transactionType",
            year: { $year: "$transactionDate" },
            month: { $month: "$transactionDate" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Net balance (incoming - outgoing)
    const netBalance =
      incomingStats.completedAmount - outgoingStats.completedAmount;
    const averageIncoming =
      incomingStats.completedCount > 0
        ? incomingStats.completedAmount / incomingStats.completedCount
        : 0;
    const averageOutgoing =
      outgoingStats.completedCount > 0
        ? outgoingStats.completedAmount / outgoingStats.completedCount
        : 0;

    // Response
    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      analytics: {
        overview: {
          incoming: {
            total: incomingStats.totalAmount,
            completed: incomingStats.completedAmount,
            count: incomingStats.totalCount,
            completedCount: incomingStats.completedCount,
            average: averageIncoming,
          },
          outgoing: {
            total: outgoingStats.totalAmount,
            completed: outgoingStats.completedAmount,
            count: outgoingStats.totalCount,
            completedCount: outgoingStats.completedCount,
            average: averageOutgoing,
          },
          netBalance,
          cert80GCount,
        },
        statusBreakdown,
        categoryBreakdown,
        paymentTypeBreakdown,
        monthlyTrend,
        periodStats: period ? periodStats : null,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// POST - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return authResult.error;
    }

    await dbConnect();

    const body = await request.json();
    const { transactionType } = body;

    if (
      !transactionType ||
      !["incoming", "outgoing"].includes(transactionType)
    ) {
      return NextResponse.json(
        { success: false, error: "Valid transaction type is required" },
        { status: 400 }
      );
    }

    // Validate based on transaction type
    if (transactionType === "incoming") {
      if (
        !body.paymentType ||
        !["member", "donation"].includes(body.paymentType)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Valid payment type is required for incoming transactions",
          },
          { status: 400 }
        );
      }

      if (body.paymentType === "member" && (!body.member || !body.month)) {
        return NextResponse.json(
          {
            success: false,
            error: "Member and month are required for member payments",
          },
          { status: 400 }
        );
      }

      if (
        body.paymentType === "donation" &&
        (!body.donorName || !body.donorEmail)
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Donor name and email are required for donations",
          },
          { status: 400 }
        );
      }

      if (body.needs80G && !body.panCard) {
        return NextResponse.json(
          { success: false, error: "PAN card is required for 80G certificate" },
          { status: 400 }
        );
      }
    } else if (transactionType === "outgoing") {
      if (!body.recipientName || !body.purpose || !body.category) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Recipient name, purpose, and category are required for outgoing transactions",
          },
          { status: 400 }
        );
      }

      // Set paidBy to current user
      body.paidBy = authResult.user._id;
      body.paidAt = new Date();
    }

    // Set defaults
    body.transactionDate = body.transactionDate || new Date();
    body.status =
      body.status || (transactionType === "outgoing" ? "completed" : "pending");

    const transaction = await Transaction.create(body);
    await transaction.populate("member", "name email phone");
    await transaction.populate("paidBy", "name email");

    return NextResponse.json(
      {
        success: true,
        message: `${transactionType === "incoming" ? "Payment" : "Payout"} created successfully`,
        transaction,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating transaction:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

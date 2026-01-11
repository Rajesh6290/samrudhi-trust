import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import Member from "@/models/Member";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      paymentType,
      memberId,
      month,
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      amount,
      needs80G,
      panCard,
    } = body;

    // Validate payment type
    if (!paymentType || !["member", "donation"].includes(paymentType)) {
      return NextResponse.json(
        { error: "Invalid payment type" },
        { status: 400 }
      );
    }

    // Validate amount
    if (!amount || amount < 200) {
      return NextResponse.json(
        { error: "Minimum payment amount is ₹200" },
        { status: 400 }
      );
    }
    // Check if member exists
    const member = await Member.findById(memberId);
    // Member payment validations
    if (paymentType === "member") {
      if (!memberId || !month) {
        return NextResponse.json(
          { error: "Member ID and month are required for member payments" },
          { status: 400 }
        );
      }

      if (!member) {
        return NextResponse.json(
          { error: "Member not found" },
          { status: 404 }
        );
      }

      // Check if payment already exists for this month (check both collections)
      const existingPayment = await Payment.findOne({
        member: memberId,
        month: new Date(month),
        status: { $in: ["completed", "pending"] },
      });

      const existingTransaction = await Transaction.findOne({
        transactionType: "incoming",
        paymentType: "member",
        member: memberId,
        month: new Date(month),
        status: { $in: ["completed", "pending"] },
      });

      if (existingPayment || existingTransaction) {
        const existingRecord = existingPayment || existingTransaction;

        if (existingRecord && existingRecord.status === "completed") {
          return NextResponse.json(
            { error: "Payment for this month already completed" },
            { status: 400 }
          );
        }

        if (existingRecord && existingRecord.status === "pending") {
          return NextResponse.json(
            {
              error:
                "Payment for this month is already pending. Please check your email and complete the pending payment, or retry from My Donations page.",
              pendingPaymentId: existingRecord._id,
              isPending: true,
            },
            { status: 400 }
          );
        }
      }
    }

    // Donation validations
    if (paymentType === "donation") {
      if (!donorName || !donorEmail) {
        return NextResponse.json(
          { error: "Donor name and email are required for donations" },
          { status: 400 }
        );
      }

      const existingMember = await Member.findOne({ email: donorEmail });
      if (existingMember) {
        // Get current month in YYYY-MM format
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentMonthStart = new Date(currentMonth + "-01");
        const nextMonthStart = new Date(
          new Date(currentMonthStart).setMonth(currentMonthStart.getMonth() + 1)
        );

        // Check for completed donation in current month
        const currentMonthPayment = await Payment.findOne({
          donorEmail,
          status: "completed",
          transactionDate: { $gte: currentMonthStart, $lt: nextMonthStart },
        });

        const currentMonthTransaction = await Transaction.findOne({
          donorEmail,
          transactionType: "incoming",
          status: "completed",
          transactionDate: { $gte: currentMonthStart, $lt: nextMonthStart },
        });

        if (currentMonthPayment || currentMonthTransaction) {
          return NextResponse.json(
            {
              error:
                "You have already made a donation for this month. Thank you for your contribution!",
            },
            { status: 400 }
          );
        }

        // Check for pending payment in last 24 hours
        const existingPaymentCheck = await Payment.findOne({
          donorEmail,
          status: "pending",
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        const existingTransactionCheck = await Transaction.findOne({
          donorEmail,
          transactionType: "incoming",
          status: "pending",
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        if (existingPaymentCheck || existingTransactionCheck) {
          const existing = existingPaymentCheck || existingTransactionCheck;
          return NextResponse.json(
            {
              error:
                "You have a pending payment. Please check your email and complete the pending payment, or retry from My Donations page.",
              pendingPaymentId: existing!._id,
              isPending: true,
            },
            { status: 400 }
          );
        }
      }
    }

    // 80G validation
    if (needs80G && !panCard) {
      return NextResponse.json(
        { error: "PAN card is required for 80G certificate" },
        { status: 400 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
    });

    // Get member name if member payment
    let memberName = donorName;
    if (paymentType === "member" && memberId) {
      const member = await Member.findById(memberId);
      memberName = member?.name || donorName;
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        paymentType,
        memberId: memberId || "",
        donorName: memberName,
        month: month || "",
        needs80G: needs80G ? "yes" : "no",
      },
    });

    // Create payment record
    const paymentData: {
      paymentType: string;
      amount: number;
      status: string;
      razorpayOrderId: string;
      donorName: string;
      donorEmail: string;
      donorPhone?: string;
      donorAddress?: string;
      needs80G: boolean;
      member?: string;
      month?: Date;
      panCard?: string;
    } = {
      paymentType,
      amount,
      status: "pending",
      razorpayOrderId: order.id,
      donorName,
      donorEmail,
      donorPhone,
      donorAddress, // Save address for both types
      needs80G: Boolean(needs80G), // Explicitly convert to boolean
    };

    if (paymentType === "member") {
      paymentData.member = memberId;
      paymentData.month = new Date(month);
    }

    if (needs80G && panCard) {
      paymentData.panCard = panCard.toUpperCase();
    }

    // Create payment record in Payment collection (for backward compatibility)
    const payment = await Payment.create(paymentData);

    // Also create in Transaction collection (new unified system)
    const transactionData = {
      transactionType: "incoming" as const,
      paymentType,
      amount,
      transactionDate: new Date(),
      status: "pending" as const,
      razorpayOrderId: order.id,
      donorName,
      donorEmail,
      donorPhone,
      donorAddress,
      needs80G: Boolean(needs80G),
      panCard: needs80G && panCard ? panCard.toUpperCase() : undefined,
      member: paymentType === "member" ? memberId : undefined,
      month: paymentType === "member" ? new Date(month) : undefined,
      invoiceSent: false,
      retryCount: 0,
      maxRetries: 3,
      webhookReceived: false,
      reconciliationStatus: "not_required" as const,
    };

    await Transaction.create(transactionData);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error creating payment order:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create payment order" },
      { status: 500 }
    );
  }
}

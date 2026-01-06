import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
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

      // Check if payment already exists for this month
      const existingPayment = await Payment.findOne({
        member: memberId,
        month: new Date(month),
        status: { $in: ["completed", "pending"] },
      });
      if (existingPayment) {
        return NextResponse.json(
          { error: "Payment for this month already exists" },
          { status: 400 }
        );
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
        const existingPaymentCheck = await Payment.findOne({
          donorEmail,
          month: new Date(month),
          status: { $in: ["completed", "pending"] },
        });
        if (existingPaymentCheck) {
          return NextResponse.json(
            {
              error:
                "This email belongs to an existing member who has already paid for this month",
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
    const payment = await Payment.create(paymentData);

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

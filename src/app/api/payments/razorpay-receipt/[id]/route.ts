import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status !== "completed") {
      return NextResponse.json(
        { error: "Receipt only available for completed payments" },
        { status: 400 }
      );
    }

    if (!payment.razorpayPaymentId) {
      return NextResponse.json(
        { error: "Razorpay payment ID not found" },
        { status: 404 }
      );
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
    });

    // Fetch payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(
      payment.razorpayPaymentId
    );

    // Return Razorpay receipt URL - users can view/download from Razorpay
    // Razorpay automatically generates receipts for all payments
    const receiptUrl = `https://api.razorpay.com/v1/payments/${payment.razorpayPaymentId}/receipt`;

    return NextResponse.json({
      success: true,
      receipt: {
        paymentId: razorpayPayment.id,
        orderId: razorpayPayment.order_id,
        amount: razorpayPayment.amount / 100,
        currency: razorpayPayment.currency,
        status: razorpayPayment.status,
        method: razorpayPayment.method,
        email: razorpayPayment.email,
        contact: razorpayPayment.contact,
        createdAt: new Date(razorpayPayment.created_at * 1000).toISOString(),
        description: razorpayPayment.description,
      },
      receiptUrl,
      message: "Razorpay payment receipt",
    });
  } catch (error) {
    const err = error as Error;
    console.error("Error fetching Razorpay receipt:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch receipt" },
      { status: 500 }
    );
  }
}

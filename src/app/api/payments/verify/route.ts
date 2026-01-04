import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = await req.json();

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find payment first
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Generate invoice number if not exists
    if (!payment.invoiceNumber) {
      const count = await Payment.countDocuments({
        invoiceNumber: { $exists: true, $ne: null },
      });
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      payment.invoiceNumber = `INV-${year}${month}-${String(count + 1).padStart(5, "0")}`;
    }

    // Generate 80G certificate number if needed and not exists
    if (payment.needs80G && !payment.certificateNumber80G) {
      const count80G = await Payment.countDocuments({
        certificateNumber80G: { $exists: true, $ne: null },
      });
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      payment.certificateNumber80G = `80G-${year}${month}-${String(count80G + 1).padStart(5, "0")}`;
      payment.certificateIssueDate = new Date();
      payment.invoiceType = "80g";
    } else if (!payment.needs80G) {
      payment.invoiceType = "standard";
    }

    // Fetch payment details from Razorpay to get method
    try {
      const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!,
      });
      const razorpayPayment =
        await razorpay.payments.fetch(razorpay_payment_id);
      payment.paymentMethod = razorpayPayment.method || "other";
    } catch (error) {
      console.error("Error fetching payment method from Razorpay:", error);
      payment.paymentMethod = "other";
    }

    // Update payment record
    payment.status = "completed";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paymentDate = new Date();
    await payment.save();

    await payment.populate("member");

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payment,
      message: "Payment verified successfully",
    });
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

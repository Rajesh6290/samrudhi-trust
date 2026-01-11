import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Transaction from "@/models/Transaction";
import { sendPaymentSuccessEmail } from "@/lib/paymentEmailService";
import {
  generateInvoicePDF,
  generate80GCertificatePDF,
} from "@/lib/emailService";

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

    // Also update in Transaction collection if exists
    const transaction = await Transaction.findOne({
      razorpayOrderId: razorpay_order_id,
      transactionType: "incoming",
    });

    if (transaction) {
      // Update transaction record
      transaction.status = "completed";
      transaction.razorpayPaymentId = razorpay_payment_id;
      transaction.razorpaySignature = razorpay_signature;
      transaction.transactionDate = new Date();
      transaction.paymentMethod = payment.paymentMethod as
        | "card"
        | "netbanking"
        | "wallet"
        | "upi"
        | "cash"
        | "bank_transfer"
        | "cheque"
        | "other"
        | undefined;
      transaction.invoiceNumber = payment.invoiceNumber;
      transaction.certificateNumber80G = payment.certificateNumber80G;
      transaction.certificateIssueDate = payment.certificateIssueDate;
      transaction.invoiceType = payment.invoiceType;
      await transaction.save();
    }

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Send payment success email with invoice PDF in background
    (async () => {
      try {
        const recipientEmail = (payment.donorEmail ||
          (payment.member &&
          typeof payment.member === "object" &&
          "email" in payment.member
            ? payment.member.email
            : "")) as string;
        const recipientName = (payment.donorName ||
          (payment.member &&
          typeof payment.member === "object" &&
          "name" in payment.member
            ? payment.member.name
            : "Valued Supporter")) as string;

        console.warn("Payment success - attempting to send email", {
          hasEmail: !!recipientEmail,
          hasInvoice: !!payment.invoiceNumber,
          hasDate: !!payment.paymentDate,
          recipientEmail,
        });

        if (recipientEmail && payment.invoiceNumber && payment.paymentDate) {
          // Prepare payment details for PDF generation
          const paymentDetails = {
            orderId: payment.razorpayOrderId || "",
            paymentId: payment.razorpayPaymentId || payment._id.toString(),
            amount: payment.amount,
            currency: "INR",
            donorName: recipientName,
            donorEmail: recipientEmail,
            donorPhone: payment.donorPhone || "",
            donorAddress: payment.donorAddress || "",
            panCard: payment.panCard || "",
            purpose:
              payment.paymentType === "member"
                ? "Membership Payment"
                : "Donation",
            paymentMethod: payment.paymentMethod || "online",
            transactionDate: payment.paymentDate.toLocaleDateString("en-IN"),
            receiptNumber: payment.invoiceNumber,
            tax80G: payment.needs80G || false,
          };

          console.warn("Generating PDF...", { needs80G: payment.needs80G });
          // Generate the correct PDF based on 80G requirement
          const invoicePDF = payment.needs80G
            ? await generate80GCertificatePDF(paymentDetails)
            : await generateInvoicePDF(paymentDetails);
          console.warn("PDF generated, size:", invoicePDF.length, "bytes", {
            type: payment.needs80G ? "80G Certificate" : "Invoice",
          });

          // Send email with PDF attachment
          console.warn("Sending payment success email...");
          await sendPaymentSuccessEmail(
            recipientEmail,
            recipientName,
            payment.amount,
            payment.invoiceNumber,
            payment.paymentDate,
            payment.needs80G || false,
            invoicePDF
          );

          console.warn("Payment success email sent to:", recipientEmail);
        } else {
          console.error(
            "Cannot send payment success email - missing required fields:",
            {
              hasEmail: !!recipientEmail,
              hasInvoice: !!payment.invoiceNumber,
              hasDate: !!payment.paymentDate,
            }
          );
        }
      } catch (emailError) {
        console.error("Failed to send payment success email:", emailError);
        // Don't fail the payment verification if email fails
      }
    })();

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

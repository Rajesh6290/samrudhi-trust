import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Payment from "@/models/Payment";
import crypto from "crypto";
import { getBaseUrl } from "@/lib/getBaseUrl";

/**
 * API to generate retry payment link for failed payments
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { transactionId } = await req.json();

    console.log("Generating retry link for transaction:", transactionId);

    // Find the transaction
    let transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      console.log("Not found in Transaction, checking Payment...");
      transaction = await Payment.findById(transactionId);
    }

    if (!transaction) {
      console.log("Transaction/Payment not found");
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    console.log("Found transaction/payment with status:", transaction.status);

    if (transaction.status === "completed") {
      return NextResponse.json(
        { error: "Transaction already completed" },
        { status: 400 }
      );
    }

    // Generate secure token (valid for 7 days)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    console.log("Generated token:", token.substring(0, 10) + "...");

    // Store token with transaction
    transaction.retryToken = token;
    transaction.retryTokenExpiry = expiresAt;
    await transaction.save();

    console.log("Saved token to database");

    const paymentLink = `${getBaseUrl() || "http://localhost:3000"}/payment/retry/${token}`;

    return NextResponse.json({
      success: true,
      paymentLink,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("Error generating payment link:", error);
    return NextResponse.json(
      { error: "Failed to generate payment link" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Payment from "@/models/Payment";
import Member from "@/models/Member";
import SiteSettings from "@/models/SiteSettings";
import { sendEmail } from "@/lib/emailService";
import crypto from "crypto";
import { getBaseUrl } from "@/lib/getBaseUrl";

/**
 * API to generate retry payment link
 * Creates a secure token for failed payment retry
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { transactionId } = await req.json();

    // Find the failed transaction
    let transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      transaction = await Payment.findById(transactionId);
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

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

    // Store token with transaction
    transaction.retryToken = token;
    transaction.retryTokenExpiry = expiresAt;
    await transaction.save();

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

/**
 * GET endpoint to fetch payment details from token
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    await connectDB();
    const { token } = await params;

    console.error("Fetching payment with token:", token);

    // Find transaction with this token
    let transaction = await Transaction.findOne({
      retryToken: token,
      retryTokenExpiry: { $gt: new Date() },
    }).populate("member");

    console.error("Transaction found:", transaction ? "Yes" : "No");

    if (!transaction) {
      const payment = await Payment.findOne({
        retryToken: token,
        retryTokenExpiry: { $gt: new Date() },
      }).populate("member");

      console.error("Payment found:", payment ? "Yes" : "No");

      if (payment) {
        transaction = payment as unknown as typeof transaction;
      }
    }

    if (!transaction) {
      // Check if token exists but is expired
      const expiredTransaction = await Transaction.findOne({
        retryToken: token,
      });
      const expiredPayment = await Payment.findOne({ retryToken: token });

      const expiredDoc = expiredTransaction || expiredPayment;

      if (expiredDoc) {
        console.error("Token found but expired");

        // Mark as failed if not already
        if (expiredDoc.status !== "failed") {
          expiredDoc.status = "failed";
          expiredDoc.failureReason = "Payment link expired";
          expiredDoc.failureCode = "LINK_EXPIRED";
          await expiredDoc.save();
        }

        // Check if user is a member
        let isMember = false;
        let memberData = null;

        if (expiredDoc.member) {
          memberData = await Member.findById(expiredDoc.member);
          isMember = !!memberData;
        } else if (expiredDoc.donorEmail) {
          memberData = await Member.findOne({ email: expiredDoc.donorEmail });
          isMember = !!memberData;
        }

        // Fetch site settings for email
        const settings = await SiteSettings.findOne();
        const orgName = settings?.organizationName;
        const orgEmail = settings?.email || "";
        const orgPhone = settings?.phone || "";
        const orgAddress = settings?.address || "";
        const baseUrl = getBaseUrl() || "http://localhost:3000";

        // Send email notification
        try {
          const paymentType =
            expiredDoc.paymentType === "member"
              ? "Membership Payment"
              : "Donation";
          const recipientName =
            expiredDoc.donorName || memberData?.name || "Valued Supporter";
          const recipientEmail = expiredDoc.donorEmail || memberData?.email;

          if (recipientEmail) {
            let actionLink = "";
            let actionText = "";
            let loginInfo = "";

            if (isMember) {
              actionLink = `${baseUrl}/admin/my-donations`;
              actionText = "Login to My Donations";
              loginInfo = `<p>You can login to your account and make a new payment from the <strong>My Donations</strong> page.</p>
                          <p>Alternatively, you can make a ${expiredDoc.paymentType === "member" ? "membership payment" : "new donation"} directly:</p>`;

              if (expiredDoc.paymentType === "member") {
                actionLink = `${baseUrl}/members/payments`;
                actionText = "Make Membership Payment";
              }
            } else {
              actionLink = `${baseUrl}/donation`;
              actionText = "Make New Donation";
              loginInfo = `<p>You can make a new donation by clicking the button below:</p>`;
            }

            await sendEmail({
              to: recipientEmail,
              subject: `Payment Link Expired - ${paymentType}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
                    <img src="${baseUrl}/logo.svg" alt="${orgName}" style="height: 60px; margin-bottom: 20px;" />
                    <h1 style="color: white; margin: 0; font-size: 28px;">Payment Link Expired</h1>
                  </div>
                  
                  <div style="padding: 30px; background: #f9fafb;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${recipientName},</p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                      Your payment link for <strong>${paymentType}</strong> of <strong>₹${expiredDoc.amount}</strong> has expired and the payment was not completed.
                    </p>
                    
                    ${loginInfo}
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${actionLink}" 
                         style="background: #f97316; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px;">
                        ${actionText}
                      </a>
                    </div>
                    
                    ${
                      isMember
                        ? `
                    <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0;">
                      <p style="color: #0c4a6e; margin: 0; font-size: 14px;">
                        <strong>Quick Access:</strong> Login at <a href="${baseUrl}/login" style="color: #0284c7;">Member Portal</a> → My Donations
                      </p>
                    </div>
                    `
                        : ""
                    }
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                      If you have any questions, please don't hesitate to contact us.
                    </p>
                    
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                      Thank you for your continued support!<br>
                      <strong>${orgName}</strong>
                    </p>
                  </div>
                  
                  <div style="background: #1f2937; padding: 20px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © 2026 ${orgName}. All rights reserved.
                    </p>
                    ${orgEmail ? `<p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">Email: ${orgEmail} | Phone: ${orgPhone}</p>` : ""}
                    ${orgAddress ? `<p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">${orgAddress}</p>` : ""}
                  </div>
                </div>
              `,
            });

            console.error("Sent expiry notification email to:", recipientEmail);
          }
        } catch (emailError) {
          console.error("Error sending expiry email:", emailError);
        }

        return NextResponse.json(
          {
            error:
              "Payment link has expired. We've sent you an email with instructions to make a new payment.",
          },
          { status: 410 }
        );
      }

      console.error("Token not found in database");
      return NextResponse.json(
        { error: "Invalid or expired payment link" },
        { status: 404 }
      );
    }

    // Check if user is a member (for frontend to conditionally show buttons)
    let isMember = false;
    if (transaction.member) {
      isMember = true;
    } else if (transaction.donorEmail) {
      const memberCheck = await Member.findOne({
        email: transaction.donorEmail,
      });
      isMember = !!memberCheck;
    }

    // Return payment details
    return NextResponse.json({
      success: true,
      amount: transaction.amount,
      paymentType: transaction.paymentType,
      donorName: transaction.donorName,
      donorEmail: transaction.donorEmail,
      donorPhone: transaction.donorPhone,
      donorAddress: transaction.donorAddress,
      needs80G: transaction.needs80G,
      panCard: transaction.panCard,
      memberId: transaction.member?._id,
      month: transaction.month,
      transactionId: transaction._id,
      isMember, // Add this flag
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment details" },
      { status: 500 }
    );
  }
}

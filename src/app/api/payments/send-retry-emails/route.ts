import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import Payment from "@/models/Payment";
import SiteSettings from "@/models/SiteSettings";
import { sendEmail } from "@/lib/emailService";
import crypto from "crypto";
import { getBaseUrl } from "@/lib/getBaseUrl";

/**
 * Cron job to send payment retry emails to users with failed payments
 * Should be run periodically (e.g., daily)
 */
export async function POST() {
  try {
    await connectDB();
    // Fetch site settings
    const settings = await SiteSettings.findOne();
    const orgName = settings?.organizationName;
    const orgEmail = settings?.email || "";
    const orgPhone = settings?.phone || "";
    const orgAddress = settings?.address || "";
    const baseUrl = getBaseUrl() || "http://localhost:3000";
    // Find failed payments from last 7 days that haven't been notified
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find failed transactions
    const failedTransactions = await Transaction.find({
      status: "failed",
      createdAt: { $gte: sevenDaysAgo },
      retryEmailSent: { $ne: true },
      donorEmail: { $exists: true, $ne: "" },
    }).limit(50); // Process 50 at a time

    // Also check old Payment model
    const failedPayments = await Payment.find({
      status: "failed",
      createdAt: { $gte: sevenDaysAgo },
      retryEmailSent: { $ne: true },
      donorEmail: { $exists: true, $ne: "" },
    }).limit(50);

    const allFailed = [...failedTransactions, ...failedPayments];
    let successCount = 0;
    let failCount = 0;

    for (const transaction of allFailed) {
      try {
        // Generate retry token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        transaction.retryToken = token;
        transaction.retryTokenExpiry = expiresAt;

        const paymentLink = `${baseUrl}/payment/retry/${token}`;

        // Send email
        const emailSent = await sendEmail({
          to: transaction.donorEmail || "",
          subject: `Complete Your Payment - ${orgName}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .logo { height: 60px; margin-bottom: 15px; }
                .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                .button { display: inline-block; padding: 15px 30px; background: #f97316; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .button:hover { background: #ea580c; }
                .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .details p { margin: 10px 0; }
                .footer { text-align: center; padding: 20px; background: #1f2937; color: #9ca3af; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="${baseUrl}/logo.svg" alt="${orgName}" class="logo" />
                  <h1>🙏 Complete Your Payment</h1>
                </div>
                <div class="content">
                  <p>Dear ${transaction.donorName},</p>
                  
                  <p>We noticed that your recent payment attempt was not completed. We understand that technical issues or interruptions can happen.</p>
                  
                  <div class="details">
                    <h3 style="margin-top: 0; color: #f97316;">Payment Details:</h3>
                    <p><strong>Amount:</strong> ₹${transaction.amount}</p>
                    <p><strong>Type:</strong> ${transaction.paymentType === "member" ? "Membership Payment" : "Donation"}</p>
                    <p><strong>Date:</strong> ${new Date(transaction.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  
                  <p>You can complete your payment securely by clicking the button below:</p>
                  
                  <div style="text-align: center;">
                    <a href="${paymentLink}" class="button">Complete Payment Now</a>
                  </div>
                  
                  <p style="color: #6b7280; font-size: 14px;">This link is valid for 7 days. After clicking, you'll be redirected to our secure payment gateway.</p>
                  
                  <p>After successful payment:</p>
                  <ul>
                    <li>You'll receive a confirmation email</li>
                    <li>Your invoice will be generated automatically</li>
                    ${transaction.needs80G ? "<li>Your 80G certificate will be issued</li>" : ""}
                    <li>You can view your donation history anytime</li>
                  </ul>
                  
                  <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
                  
                  <p>Thank you for your support! 🙏</p>
                  
                  <p>With gratitude,<br><strong>${orgName}</strong></p>
                </div>
                <div class="footer">
                  <p>\u00a9 2026 ${orgName}. All rights reserved.</p>
                  ${orgEmail ? `<p>Email: ${orgEmail} | Phone: ${orgPhone}</p>` : ""}
                  ${orgAddress ? `<p>${orgAddress}</p>` : ""}
                  <p style="margin-top: 10px;">This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        if (emailSent) {
          transaction.retryEmailSent = true;
          transaction.retryEmailSentAt = new Date();
          await transaction.save();
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(
          `Failed to send email for transaction ${transaction._id}:`,
          error
        );
        failCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Retry emails sent",
      totalProcessed: allFailed.length,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("Error in payment retry cron:", error);
    return NextResponse.json(
      { error: "Failed to send retry emails" },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check how many failed payments need retry emails
 */
export async function GET() {
  try {
    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pendingTransactions = await Transaction.countDocuments({
      status: "failed",
      createdAt: { $gte: sevenDaysAgo },
      retryEmailSent: { $ne: true },
      donorEmail: { $exists: true, $ne: "" },
    });

    const pendingPayments = await Payment.countDocuments({
      status: "failed",
      createdAt: { $gte: sevenDaysAgo },
      retryEmailSent: { $ne: true },
      donorEmail: { $exists: true, $ne: "" },
    });

    return NextResponse.json({
      success: true,
      pendingTransactions,
      pendingPayments,
      total: pendingTransactions + pendingPayments,
    });
  } catch (error) {
    console.error("Error checking pending retry emails:", error);
    return NextResponse.json(
      { error: "Failed to check pending emails" },
      { status: 500 }
    );
  }
}

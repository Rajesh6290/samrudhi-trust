import crypto from "crypto";
import { sendEmail } from "./emailService";
import SiteSettings from "@/models/SiteSettings";
import Member from "@/models/Member";
import connectDB from "./mongodb";
import { getBaseUrl } from "./getBaseUrl";
import { Types } from "mongoose";

// Type for Payment/Transaction document
interface PaymentDocument {
  _id: string | Types.ObjectId;
  amount: number;
  donorEmail?: string;
  donorName?: string;
  paymentType?: string;
  member?: string | Types.ObjectId;
  needs80G?: boolean;
  createdAt: Date;
  failureReason?: string;
  retryToken?: string;
  retryTokenExpiry?: Date;
  retryEmailSent?: boolean;
  retryEmailSentAt?: Date;
  save: () => Promise<unknown>;
}

/**
 * Send immediate retry email when payment fails
 * This ensures users don't wait for the daily 9 AM cron job
 */
export async function sendImmediateRetryEmail(
  paymentDoc: PaymentDocument
): Promise<boolean> {
  try {
    await connectDB();

    // Fetch site settings
    const settings = await SiteSettings.findOne();
    const orgName = settings?.organizationName || "Our Organization";
    const orgEmail = settings?.email || "support@example.org";
    const orgPhone = settings?.phone || "";
    const orgAddress = settings?.address || "";
    const baseUrl = getBaseUrl() || "http://localhost:3000";

    // Generate retry token if doesn't exist
    if (
      !paymentDoc.retryToken ||
      !paymentDoc.retryTokenExpiry ||
      paymentDoc.retryTokenExpiry < new Date()
    ) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      paymentDoc.retryToken = token;
      paymentDoc.retryTokenExpiry = expiresAt;
      await paymentDoc.save();
    }

    const paymentLink = `${baseUrl}/payment/retry/${paymentDoc.retryToken}`;
    const recipientEmail = paymentDoc.donorEmail;
    const recipientName = paymentDoc.donorName || "Valued Supporter";
    const paymentType =
      paymentDoc.paymentType === "member" ? "Membership Payment" : "Donation";

    // Check if user is a member
    let isMember = false;
    if (paymentDoc.member) {
      isMember = true;
    } else if (paymentDoc.donorEmail) {
      const memberCheck = await Member.findOne({
        email: paymentDoc.donorEmail,
      });
      isMember = !!memberCheck;
    }

    if (!recipientEmail) {
      console.error(
        "No email address found for payment:",
        paymentDoc._id.toString()
      );
      return false;
    }

    // Send email
    await sendEmail({
      to: recipientEmail,
      subject: `Payment Retry Available - ${orgName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; }
            .header { background: #ffffff; padding: 32px 40px 24px; border-bottom: 2px solid #e5e7eb; text-align: center; }
            .logo { max-height: 50px; width: auto; margin-bottom: 0; }
            .content { padding: 40px; }
            .title { font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 24px 0; }
            .text { font-size: 15px; color: #4b5563; margin: 0 0 16px 0; }
            .button { display: inline-block; padding: 14px 32px; background: #2563eb !important; color: #ffffff !important; text-decoration: none !important; border-radius: 6px; font-weight: 600; margin: 24px 0; }
            .button:hover { background: #1d4ed8 !important; }
            .details-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 24px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #6b7280; }
            .detail-value { color: #111827; }
            .info-box { background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px; margin: 24px 0; border-radius: 4px; }
            .footer { background: #f9fafb; padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="${baseUrl}/logo.svg" alt="${orgName}" class="logo" onerror="this.style.display='none'" />
            </div>
            <div class="content">
              <h1 class="title">Payment Incomplete</h1>
              <p class="text">Dear ${recipientName},</p>
              <p class="text">Your recent payment attempt was not completed. You can retry your payment securely using the button below.</p>
              
              <div class="details-box">
                <div class="detail-row">
                  <span class="detail-label">Amount</span>
                  <span class="detail-value">₹${paymentDoc.amount.toLocaleString("en-IN")}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Type</span>
                  <span class="detail-value">${paymentType}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date</span>
                  <span class="detail-value">${new Date(paymentDoc.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${paymentLink}" class="button">Retry Payment</a>
              </div>
              
              ${
                isMember
                  ? `
              <div class="info-box">
                <p class="text" style="margin: 0; font-size: 14px;">You can also retry from your <a href="${baseUrl}/admin/my-donations" style="color: #2563eb; text-decoration: none; font-weight: 600;">My Donations</a> page</p>
              </div>
              `
                  : ""
              }
              
              <p class="text" style="margin-top: 32px; font-size: 14px; color: #6b7280;">This payment link is valid for 7 days. If you need assistance, please contact us at <a href="mailto:${orgEmail}" style="color: #2563eb; text-decoration: none;">${orgEmail}</a></p>
            </div>
            <div class="footer">
              <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
              ${orgEmail ? `<p style="margin: 0;">${orgEmail}${orgPhone ? ` • ${orgPhone}` : ""}</p>` : ""}
              ${orgAddress ? `<p style="margin: 8px 0 0 0;">${orgAddress}</p>` : ""}
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Mark as email sent
    paymentDoc.retryEmailSent = true;
    paymentDoc.retryEmailSentAt = new Date();
    await paymentDoc.save();

    console.warn("Immediate retry email sent to:", recipientEmail);
    return true;
  } catch (error) {
    console.error("Error sending immediate retry email:", error);
    return false;
  }
}

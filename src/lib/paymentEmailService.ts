import { sendEmail as sendEmailHelper } from "./emailService";
import SiteSettings from "@/models/SiteSettings";
import connectDB from "@/lib/mongodb";
import { getBaseUrl } from "./getBaseUrl";

/**
 * Professional email templates for payment-related notifications
 */

const getEmailStyles = () => `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
  .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e0e0e0; }
  .header { background: #ffffff; padding: 20px; border-bottom: 1px solid #e0e0e0; text-align: center; }
  .logo { max-height: 60px; width: auto; display: block; margin: 0 auto; }
  .content { padding: 30px 25px; }
  .title { font-size: 20px; font-weight: 600; color: #000; margin: 0 0 15px 0; }
  .text { font-size: 14px; color: #555; margin: 0 0 12px 0; line-height: 1.6; }
  .button { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 500; margin: 15px 0; font-size: 14px; }
  .details-box { border: 1px solid #e0e0e0; padding: 15px; margin: 20px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { font-weight: 500; color: #666; font-size: 13px; }
  .detail-value { color: #000; font-weight: 500; font-size: 13px; }
  .info-box { background: #f9f9f9; border-left: 3px solid #000; padding: 15px; margin: 20px 0; font-size: 13px; }
  .footer { background: #fafafa; padding: 15px 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #777; }
`;

/**
 * Send email when money is deducted but payment shows as pending/failed
 */
export async function sendPaymentDiscrepancyEmail(
  recipientEmail: string,
  recipientName: string,
  amount: number,
  razorpayOrderId: string,
  isMember: boolean
): Promise<void> {
  await connectDB();

  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  const baseUrl = getBaseUrl() || "http://localhost:3000";

  await sendEmailHelper({
    to: recipientEmail,
    subject: `Payment Under Verification - ${orgName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.svg" alt="${orgName}" class="logo" onerror="this.style.display='none'" />
          </div>
          <div class="content">
            <h1 class="title">Payment Under Verification</h1>
            <p class="text">Dear ${recipientName},</p>
            <p class="text">We have received your payment request for <strong>₹${amount.toLocaleString("en-IN")}</strong>. There is a slight delay in confirming the payment status with our payment gateway.</p>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">₹${amount.toLocaleString("en-IN")}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order ID</span>
                <span class="detail-value">${razorpayOrderId}</span>
              </div>
            </div>
            
            <div class="info-box">
              <p class="text" style="margin: 0; font-size: 14px;"><strong>What's happening?</strong><br>Your payment is being verified with our payment gateway. This usually takes 24-48 hours. If money was deducted from your account, it will be reflected within 2 business days.</p>
            </div>
            
            ${
              isMember
                ? `
            <div style="text-align: center; margin: 24px 0;">
              <a href="${baseUrl}/admin/my-donations" class="button">View Payment Status</a>
            </div>
            `
                : ""
            }
            
            <p class="text" style="margin-top: 32px; font-size: 14px; color: #6b7280;">If you have any questions, please contact us at <a href="mailto:${orgEmail}" style="color: #2563eb; text-decoration: none;">${orgEmail}</a></p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
            ${orgEmail ? `<p style="margin: 0;">${orgEmail}${orgPhone ? ` • ${orgPhone}` : ""}</p>` : ""}
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send payment failure notification
 */
export async function sendPaymentFailureEmail(
  email: string,
  name: string,
  amount: number,
  orderId: string,
  failureReason: string
) {
  await connectDB();

  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  const baseUrl = getBaseUrl() || "http://localhost:3000";

  return sendEmailHelper({
    to: email,
    subject: `Payment Failed - ${orgName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.svg" alt="${orgName}" class="logo" onerror="this.style.display='none'" />
          </div>
          <div class="content">
            <h1 class="title">Payment Could Not Be Processed</h1>
            <p class="text">Dear ${name},</p>
            <p class="text">We're sorry, but your payment could not be processed.</p>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">₹${amount.toLocaleString("en-IN")}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Order ID</span>
                <span class="detail-value">${orderId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reason</span>
                <span class="detail-value">${failureReason}</span>
              </div>
            </div>
            
            <div class="info-box">
              <p class="text" style="margin: 0; font-size: 14px;">If money was deducted from your account, it will be automatically refunded within 5-7 business days.</p>
            </div>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${baseUrl}/donation" class="button">Try Again</a>
            </div>
            
            <p class="text" style="margin-top: 32px; font-size: 14px; color: #6b7280;">If you continue to face issues, please contact us at <a href="mailto:${orgEmail}" style="color: #2563eb; text-decoration: none;">${orgEmail}</a></p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
            ${orgEmail ? `<p style="margin: 0;">${orgEmail}${orgPhone ? ` • ${orgPhone}` : ""}</p>` : ""}
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  amount: number,
  invoiceNumber: string,
  paymentDate: Date,
  needs80G: boolean,
  invoicePDF?: Buffer
) {
  await connectDB();

  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  const baseUrl = getBaseUrl() || "http://localhost:3000";

  return sendEmailHelper({
    to: email,
    subject: `Payment Successful - ${orgName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.svg" alt="${orgName}" class="logo" onerror="this.style.display='none'" />
          </div>
          <div class="content">
            <h1 class="title">Payment Received Successfully</h1>
            <p class="text">Dear ${name},</p>
            <p class="text">Thank you for your payment. We have successfully received your contribution of ₹${amount.toLocaleString("en-IN")}.</p>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Amount Paid</span>
                <span class="detail-value">₹${amount.toLocaleString("en-IN")}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invoice Number</span>
                <span class="detail-value">${invoiceNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date</span>
                <span class="detail-value">${new Date(paymentDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
            </div>
            
            ${
              needs80G
                ? `
            <div class="info-box">
              <strong>80G Tax Certificate:</strong> Your 80G tax exemption certificate has been generated and is attached to this email.
            </div>
            `
                : ""
            }
            
            <p class="text">Your ${needs80G ? "80G certificate" : "invoice"} is attached to this email for your records.</p>
            
            <p class="text" style="margin-top: 20px; font-size: 13px; color: #666;">If you have any questions, please contact us at <a href="mailto:${orgEmail}" style="color: #000; text-decoration: underline;">${orgEmail}</a>${orgPhone ? ` or call ${orgPhone}` : ""}.</p>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: invoicePDF
      ? [
          {
            filename: `Invoice-${invoiceNumber}.pdf`,
            content: invoicePDF,
            contentType: "application/pdf",
          },
        ]
      : undefined,
  });
}

/**
 * Send refund notification
 */
export async function sendRefundEmail(
  email: string,
  name: string,
  amount: number,
  refundId: string,
  refundReason: string
) {
  await connectDB();

  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  const baseUrl = getBaseUrl() || "http://localhost:3000";

  return sendEmailHelper({
    to: email,
    subject: `Refund Initiated - ${orgName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.svg" alt="${orgName}" class="logo" onerror="this.style.display='none'" />
          </div>
          <div class="content">
            <h1 class="title">Refund Initiated</h1>
            <p class="text">Dear ${name},</p>
            <p class="text">We have initiated a refund for your payment.</p>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">₹${amount.toLocaleString("en-IN")}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Refund ID</span>
                <span class="detail-value">${refundId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Reason</span>
                <span class="detail-value">${refundReason}</span>
              </div>
            </div>
            
            <div class="info-box">
              <p class="text" style="margin: 0; font-size: 14px;">The refund will be processed to your original payment method within 5-7 business days.</p>
            </div>
            
            <p class="text" style="margin-top: 32px; font-size: 14px; color: #6b7280;">If you have any questions, please contact us at <a href="mailto:${orgEmail}" style="color: #2563eb; text-decoration: none;">${orgEmail}</a></p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 8px 0;">© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
            ${orgEmail ? `<p style="margin: 0;">${orgEmail}${orgPhone ? ` • ${orgPhone}` : ""}</p>` : ""}
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send admin alert for payment requiring intervention
 */
export async function sendAdminPaymentAlertEmail(
  paymentId: string,
  amount: number,
  donorEmail: string,
  donorName: string,
  issue: string
) {
  await connectDB();

  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const baseUrl = getBaseUrl() || "http://localhost:3000";
  const adminEmail =
    process.env.ADMIN_EMAIL || settings?.email || "admin@example.org";

  return sendEmailHelper({
    to: adminEmail,
    subject: `Payment Alert: Manual Intervention Required - ${orgName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${getEmailStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.svg" alt="${orgName}" class="logo" onerror="this.style.display='none'" />
          </div>
          <div class="content">
            <h1 class="title">Payment Alert - Manual Intervention Required</h1>
            
            <div class="warning-box">
              <p class="text" style="margin: 0; font-size: 14px;"><strong>Issue:</strong> ${issue}</p>
            </div>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Payment ID</span>
                <span class="detail-value">${paymentId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount</span>
                <span class="detail-value">₹${amount.toLocaleString("en-IN")}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Donor Name</span>
                <span class="detail-value">${donorName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Donor Email</span>
                <span class="detail-value">${donorEmail}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 24px 0;">
              <a href="${baseUrl}/admin/payments/reconciliation" class="button">View Payment</a>
            </div>
          </div>
          <div class="footer">
            <p style="margin: 0;">© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

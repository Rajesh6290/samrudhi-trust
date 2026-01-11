import nodemailer from "nodemailer";
import { sendEmail as sendEmailHelper } from "./emailService";
import SiteSettings from "@/models/SiteSettings";
import connectDB from "@/lib/mongodb";
import { getBaseUrl } from "./getBaseUrl";

/**
 * Email notification service for payment-related events
 * Handles sending emails for payment failures, refunds, and reconciliation issues
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email to customer when money is deducted but payment shows as pending/failed
 */
export async function sendPaymentDiscrepancyEmail(
  recipientEmail: string,
  recipientName: string,
  amount: number,
  razorpayOrderId: string,
  isMember: boolean
): Promise<void> {
  await connectDB();

  // Fetch site settings
  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  const orgAddress = settings?.address || "";
  const baseUrl = getBaseUrl() || "http://localhost:3000";
  const supportEmail = orgEmail;
  const contactLink = `${baseUrl}/contact`;

  await sendEmailHelper({
    to: recipientEmail,
    subject: `Payment Under Verification - ${orgName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
          <img src="${baseUrl}/logo.svg" alt="${orgName}" style="height: 60px; margin-bottom: 15px;" />
          <h1 style="color: white; margin: 0; font-size: 28px;">Payment Under Verification</h1>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${recipientName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We have received your payment request for <strong>₹${amount}</strong>, but there seems to be a slight delay in confirming the payment status with our payment gateway.
          </p>
          
          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">What's Happening?</h3>
            <p style="color: #1e3a8a; margin: 0; font-size: 14px; line-height: 1.6;">
              Your payment is currently being verified with Razorpay. This usually happens when:<br>
              • Money has been deducted from your account<br>
              • But the payment confirmation is delayed<br>
              • Or there was a network interruption during payment
            </p>
          </div>
          
          <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">What Should You Do?</h3>
            <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>Please wait 24-48 hours.</strong> Our system automatically verifies payments every few hours. If money was deducted from your account, it will be reflected within 2 business days.
            </p>
          </div>
          
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="color: #065f46; margin: 0 0 10px 0; font-size: 18px;">Check Your Payment Status</h3>
            <p style="color: #064e3b; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
              ${
                isMember
                  ? "You can check your payment status anytime by logging into your account:"
                  : "If you have an account with us, you can check your payment status:"
              }
            </p>
            <div style="text-align: center; margin: 20px 0;">
              ${
                isMember
                  ? `
                <a href="${baseUrl}/admin/my-donations" 
                   style="background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 5px;">
                  View My Donations
                </a>
              `
                  : `
                <a href="${baseUrl}/login" 
                   style="background: #3b82f6; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 16px; margin: 5px;">
                  Login to Check Status
                </a>
              `
              }
            </div>
          </div>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="color: #991b1b; margin: 0 0 10px 0; font-size: 18px;">Payment Reference</h3>
            <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.6;">
              <strong>Order ID:</strong> ${razorpayOrderId}<br>
              <strong>Amount:</strong> ₹${amount}<br>
              <strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}
            </p>
            <p style="color: #7f1d1d; margin: 15px 0 0 0; font-size: 12px;">
              Please save this information for your records.
            </p>
          </div>
          
          <div style="background: white; border: 2px solid #e5e7eb; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">Need Immediate Help?</h3>
            <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
              If money has been deducted from your account and still shows as pending after 48 hours, please contact us:
            </p>
            <div style="text-align: center;">
              <a href="${contactLink}" 
                 style="background: #f97316; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; font-size: 14px; margin: 5px;">
                Contact Support
              </a>
              <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
                Or email us at: <a href="mailto:${supportEmail}" style="color: #3b82f6;">${supportEmail}</a>
              </p>
            </div>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
            <strong>Important:</strong> Do NOT make another payment for the same purpose. Our team is actively monitoring this and will update your payment status soon.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Thank you for your patience and support!<br>
            <strong>${orgName}</strong>
          </p>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} ${orgName}. All rights reserved.
          </p>
          ${orgEmail ? `<p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">Email: ${orgEmail} | Phone: ${orgPhone}</p>` : ""}
          ${orgAddress ? `<p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">${orgAddress}</p>` : ""}
        </div>
      </div>
    `,
  });
}

// Create reusable transporter
const createTransporter = () => {
  // Use environment variables for email configuration
  const transportConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(transportConfig);
};

/**
 * Send email notification using nodemailer
 */
async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // Fetch settings for from name
    await connectDB();
    const settings = await SiteSettings.findOne();
    const fromName =
      settings?.organizationName ||
      process.env.EMAIL_FROM_NAME ||
      "Organization";

    const mailOptions = {
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.warn("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send payment failure notification to donor
 */
export async function sendPaymentFailureEmail(
  email: string,
  name: string,
  amount: number,
  orderId: string,
  failureReason: string
) {
  await connectDB();

  // Fetch site settings
  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  // orgAddress not used in this template
  const baseUrl = getBaseUrl() || "http://localhost:3000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/logo.svg" alt="${orgName}" style="height: 50px; margin-bottom: 10px;" />
          <h1>Payment Failed</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>We're sorry, but your payment could not be processed.</p>
          <p><strong>Payment Details:</strong></p>
          <ul>
            <li>Amount: ₹${amount}</li>
            <li>Order ID: ${orderId}</li>
            <li>Reason: ${failureReason}</li>
          </ul>
          <p>If money was deducted from your account, please don't worry. It will be automatically refunded to your account within 5-7 business days.</p>
          <p>If you'd like to try again, please click the button below:</p>
          <a href="${baseUrl}/donation" class="button">Try Again</a>
          <p>If you continue to face issues or have any questions, please contact us at ${orgEmail}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
          ${orgEmail ? `<p>Email: ${orgEmail} | Phone: ${orgPhone}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Payment Failed - ${orgName}`,
    html,
  });
}

/**
 * Send payment success notification with invoice
 */
export async function sendPaymentSuccessEmail(
  email: string,
  name: string,
  amount: number,
  invoiceNumber: string,
  paymentDate: Date,
  needs80G: boolean
) {
  await connectDB();

  // Fetch site settings
  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  // orgAddress not used in this template
  const baseUrl = getBaseUrl() || "http://localhost:3000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .invoice-box { background-color: white; padding: 15px; border: 1px solid #ddd; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/logo.svg" alt="${orgName}" style="height: 50px; margin-bottom: 10px;" />
          <h1>✓ Payment Successful</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for your generous contribution to ${orgName}!</p>
          <div class="invoice-box">
            <p><strong>Payment Receipt</strong></p>
            <p>Invoice Number: ${invoiceNumber}</p>
            <p>Amount: ₹${amount}</p>
            <p>Date: ${paymentDate.toLocaleDateString("en-IN")}</p>
            ${needs80G ? "<p><strong>80G Certificate will be sent separately</strong></p>" : ""}
          </div>
          <p>Your payment has been successfully processed and your invoice is attached to this email.</p>
          <p>If you have any questions, please contact us at ${orgEmail}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
          ${orgEmail ? `<p>Email: ${orgEmail} | Phone: ${orgPhone}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Payment Receipt - ${invoiceNumber} - ${orgName}`,
    html,
  });
}

/**
 * Send refund notification to donor
 */
export async function sendRefundNotificationEmail(
  email: string,
  name: string,
  amount: number,
  refundReason: string,
  refundId: string
) {
  await connectDB();

  // Fetch site settings
  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  const baseUrl = getBaseUrl() || "http://localhost:3000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ffc107; color: #333; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/logo.svg" alt="${orgName}" style="height: 50px; margin-bottom: 10px;" />
          <h1>Refund Initiated</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>We have initiated a refund for your payment.</p>
          <p><strong>Refund Details:</strong></p>
          <ul>
            <li>Amount: ₹${amount}</li>
            <li>Refund ID: ${refundId}</li>
            <li>Reason: ${refundReason}</li>
          </ul>
          <p>The refund will be processed to your original payment method within 5-7 business days.</p>
          <p>If you have any questions, please contact us at ${orgEmail}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
          ${orgEmail ? `<p>Email: ${orgEmail} | Phone: ${orgPhone}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Refund Initiated - ${orgName}`,
    html,
  });
}

/**
 * Send alert to admin for payment requiring intervention
 */
export async function sendAdminPaymentAlertEmail(
  paymentId: string,
  amount: number,
  donorEmail: string,
  donorName: string,
  issue: string
) {
  await connectDB();

  // Fetch site settings
  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const baseUrl = getBaseUrl() || "http://localhost:3000";
  const adminEmail =
    process.env.ADMIN_EMAIL || settings?.email || "admin@example.org";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .alert-box { background-color: #fff3cd; border: 2px solid #ffc107; padding: 15px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/logo.svg" alt="${orgName}" style="height: 50px; margin-bottom: 10px;" />
          <h1>⚠️ Payment Alert - Manual Intervention Required</h1>
        </div>
        <div class="content">
          <div class="alert-box">
            <p><strong>CRITICAL: Payment requires manual intervention</strong></p>
            <p>Payment ID: ${paymentId}</p>
            <p>Amount: ₹${amount}</p>
            <p>Donor: ${donorName} (${donorEmail})</p>
            <p>Issue: ${issue}</p>
          </div>
          <p><strong>Action Required:</strong></p>
          <ol>
            <li>Log in to admin panel</li>
            <li>Navigate to Payment Reconciliation</li>
            <li>Review payment details and Razorpay dashboard</li>
            <li>Contact donor if necessary</li>
            <li>Process refund if money was deducted but not captured</li>
          </ol>
          <p><a href="${baseUrl}/admin/payments">Go to Payment Management</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `🚨 URGENT: Payment #${paymentId} Requires Intervention`,
    html,
  });
}

/**
 * Send payment stuck notification to donor
 */
export async function sendPaymentStuckEmail(
  email: string,
  name: string,
  amount: number,
  orderId: string
) {
  await connectDB();

  // Fetch site settings
  const settings = await SiteSettings.findOne();
  const orgName = settings?.organizationName || "Our Organization";
  const orgEmail = settings?.email || "support@example.org";
  const orgPhone = settings?.phone || "";
  const baseUrl = getBaseUrl() || "http://localhost:3000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ffc107; color: #333; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/logo.svg" alt="${orgName}" style="height: 50px; margin-bottom: 10px;" />
          <h1>Payment Under Review</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>We noticed that your payment is under review.</p>
          <p><strong>Payment Details:</strong></p>
          <ul>
            <li>Amount: ₹${amount}</li>
            <li>Order ID: ${orderId}</li>
          </ul>
          <p>If money was deducted from your account but you haven't received a confirmation, please don't worry. We are investigating this payment.</p>
          <p><strong>What happens next:</strong></p>
          <ul>
            <li>Our team will verify the payment status with our payment gateway</li>
            <li>If the payment was successful, you'll receive your receipt within 24 hours</li>
            <li>If there was an issue, we'll process a full refund within 5-7 business days</li>
          </ul>
          <p>You can check your payment status by contacting us at ${orgEmail} with your Order ID.</p>
          <p>We apologize for any inconvenience and appreciate your patience.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${orgName}. All rights reserved.</p>
          ${orgEmail ? `<p>Email: ${orgEmail} | Phone: ${orgPhone}</p>` : ""}
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Payment Under Review - ${orgName}`,
    html,
  });
}

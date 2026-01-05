import nodemailer from "nodemailer";

/**
 * Email notification service for payment-related events
 * Handles sending emails for payment failures, refunds, and reconciliation issues
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
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

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Samrudhi Trust"}" <${process.env.SMTP_USER}>`,
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
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/donation" class="button">Try Again</a>
          <p>If you continue to face issues or have any questions, please contact us at ${process.env.SUPPORT_EMAIL || "support@samrudhitrust.org"}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Samrudhi Trust. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Payment Failed - Samrudhi Trust",
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
          <h1>✓ Payment Successful</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for your generous contribution to Samrudhi Trust!</p>
          <div class="invoice-box">
            <p><strong>Payment Receipt</strong></p>
            <p>Invoice Number: ${invoiceNumber}</p>
            <p>Amount: ₹${amount}</p>
            <p>Date: ${paymentDate.toLocaleDateString("en-IN")}</p>
            ${needs80G ? "<p><strong>80G Certificate will be sent separately</strong></p>" : ""}
          </div>
          <p>Your payment has been successfully processed and your invoice is attached to this email.</p>
          <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL || "support@samrudhitrust.org"}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Samrudhi Trust. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Payment Receipt - ${invoiceNumber} - Samrudhi Trust`,
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
          <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL || "support@samrudhitrust.org"}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Samrudhi Trust. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Refund Initiated - Samrudhi Trust",
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
  const adminEmail = process.env.ADMIN_EMAIL || "admin@samrudhitrust.org";

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
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/payments">Go to Payment Management</a></p>
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
          <p>You can check your payment status by contacting us at ${process.env.SUPPORT_EMAIL || "support@samrudhitrust.org"} with your Order ID.</p>
          <p>We apologize for any inconvenience and appreciate your patience.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Samrudhi Trust. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Payment Under Review - Samrudhi Trust",
    html,
  });
}

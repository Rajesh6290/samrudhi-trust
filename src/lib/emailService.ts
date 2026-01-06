import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";

/**
 * Enhanced Email Service
 * Handles all email sending with template support and attachments
 */

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: EmailAttachment[];
}

/**
 * Payment details type for PDF generation
 */
export interface PaymentDetails {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  donorAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  panCard?: string;
  purpose: string;
  paymentMethod: string;
  transactionDate: string;
  receiptNumber?: string;
  tax80G?: boolean;
}

// Create reusable transporter
const createTransporter = () => {
  const transportConfig = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  return nodemailer.createTransport(transportConfig);
};

/**
 * Send email with optional attachments
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions: Mail.Options = {
      from: `"${process.env.EMAIL_FROM_NAME || "Samriddhi Seva Trust"}" <${process.env.SMTP_USER}>`,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send bulk emails (with rate limiting)
 */
export async function sendBulkEmails(
  recipients: string[],
  subject: string,
  html: string,
  batchSize: number = 50
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  // Process in batches to avoid rate limiting
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    const promises = batch.map(async (email) => {
      try {
        const result = await sendEmail({
          to: email,
          subject,
          html,
        });
        return result ? "success" : "failed";
      } catch (_error) {
        return "failed";
      }
    });

    const results = await Promise.allSettled(promises);
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value === "success") {
        success++;
      } else {
        failed++;
      }
    });

    // Wait between batches to avoid rate limiting
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return { success, failed };
}

/**
 * Generate PDF invoice/receipt buffer using existing invoice template
 */
export async function generateInvoicePDF(
  paymentDetails: PaymentDetails
): Promise<Buffer> {
  try {
    // Dynamic import puppeteer only when needed
    const puppeteer = await import("puppeteer");
    const { invoice } = await import("@/features/templates/invoice");

    // Prepare invoice data
    const invoiceData = {
      organizationName: process.env.ORGANIZATION_NAME || "Samriddhi Seva Trust",
      organizationEmail:
        process.env.ORGANIZATION_EMAIL || "info@samriddhisevatrust.org",
      organizationPhone: process.env.ORGANIZATION_PHONE || "+91 1234567890",
      organizationAddress: process.env.ORGANIZATION_ADDRESS || "India",
      chairmanName: process.env.CHAIRMAN_NAME || "Chairman Name",
      chairmanPhoto: process.env.CHAIRMAN_PHOTO,
      invoiceNumber: paymentDetails.receiptNumber || paymentDetails.orderId,
      date: paymentDetails.transactionDate || new Date().toLocaleDateString(),
      donorName: paymentDetails.donorName,
      donorAddress: paymentDetails.donorAddress || "",
      donorEmail: paymentDetails.donorEmail,
      donorPhone: paymentDetails.donorPhone,
      panCard: paymentDetails.panCard,
      amount: paymentDetails.amount,
      amountInWords: numberToWords(paymentDetails.amount),
      transactionId: paymentDetails.paymentId,
      paymentMode: paymentDetails.paymentMethod,
      paymentType: paymentDetails.purpose,
    };

    const html = invoice(invoiceData);

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "8mm", bottom: "8mm", left: "8mm", right: "8mm" },
    });
    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    // Fallback to simple text buffer if PDF generation fails
    const content = `Invoice/Receipt - ${paymentDetails.receiptNumber}\nAmount: ${paymentDetails.currency} ${paymentDetails.amount}`;
    return Buffer.from(content, "utf-8");
  }
}

/**
 * Generate 80G Tax Certificate PDF using existing template
 */
export async function generate80GCertificatePDF(
  paymentDetails: PaymentDetails
): Promise<Buffer> {
  try {
    const puppeteer = await import("puppeteer");
    const { invoice80GTemplate } = await import("@/features/templates/80G");

    // Prepare 80G certificate data
    const certificateData = {
      organizationName: process.env.ORGANIZATION_NAME || "Samriddhi Seva Trust",
      organizationEmail:
        process.env.ORGANIZATION_EMAIL || "info@samriddhisevatrust.org",
      organizationPhone: process.env.ORGANIZATION_PHONE || "+91 1234567890",
      organizationAddress: process.env.ORGANIZATION_ADDRESS || "India",
      chairmanName: process.env.CHAIRMAN_NAME || "Chairman Name",
      chairmanPhoto: process.env.CHAIRMAN_PHOTO,
      receiptNo: paymentDetails.receiptNumber || paymentDetails.orderId,
      certificateNumber: `80G-${paymentDetails.receiptNumber || paymentDetails.orderId}`,
      date: paymentDetails.transactionDate || new Date().toLocaleDateString(),
      donorName: paymentDetails.donorName,
      donorAddress: paymentDetails.donorAddress || "",
      city: paymentDetails.city || "",
      state: paymentDetails.state || "",
      pincode: paymentDetails.pincode || "",
      panCard: paymentDetails.panCard,
      amount: paymentDetails.amount,
      amountInWords: numberToWords(paymentDetails.amount),
      transactionId: paymentDetails.paymentId,
      paymentMode: paymentDetails.paymentMethod,
    };

    const html = invoice80GTemplate(certificateData);

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "8mm", bottom: "8mm", left: "8mm", right: "8mm" },
    });
    await browser.close();

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error("Error generating 80G certificate PDF:", error);
    const content = `80G Certificate - ${paymentDetails.receiptNumber}\nAmount: ${paymentDetails.currency} ${paymentDetails.amount}`;
    return Buffer.from(content, "utf-8");
  }
}

/**
 * Convert number to words (Indian numbering system)
 */
function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  if (num === 0) return "Zero";

  let words = "";

  // Crores
  if (num >= 10000000) {
    words += numberToWords(Math.floor(num / 10000000)) + " Crore ";
    num %= 10000000;
  }

  // Lakhs
  if (num >= 100000) {
    words += numberToWords(Math.floor(num / 100000)) + " Lakh ";
    num %= 100000;
  }

  // Thousands
  if (num >= 1000) {
    words += numberToWords(Math.floor(num / 1000)) + " Thousand ";
    num %= 1000;
  }

  // Hundreds
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }

  // Tens and ones
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  } else if (num >= 10) {
    words += teens[num - 10] + " ";
    return words.trim();
  }

  if (num > 0) {
    words += ones[num] + " ";
  }

  return words.trim() + " Rupees Only";
}

/**
 * Send email with invoice/receipt PDF attachment
 */
export async function sendPaymentReceiptEmail(
  paymentDetails: PaymentDetails,
  emailTemplate: string
): Promise<boolean> {
  try {
    const attachments: EmailAttachment[] = [];

    // Generate and attach invoice PDF
    const invoicePDF = await generateInvoicePDF(paymentDetails);
    attachments.push({
      filename: `Receipt-${paymentDetails.receiptNumber || paymentDetails.orderId}.pdf`,
      content: invoicePDF,
      contentType: "application/pdf",
    });

    // Generate and attach 80G certificate if applicable
    if (paymentDetails.tax80G) {
      const certificatePDF = await generate80GCertificatePDF(paymentDetails);
      attachments.push({
        filename: `80G-Certificate-${paymentDetails.receiptNumber}.pdf`,
        content: certificatePDF,
        contentType: "application/pdf",
      });
    }

    return await sendEmail({
      to: paymentDetails.donorEmail,
      subject: `Payment Receipt - ${paymentDetails.receiptNumber || paymentDetails.orderId}`,
      html: emailTemplate,
      attachments,
    });
  } catch (error) {
    console.error("Error sending payment receipt email:", error);
    return false;
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(to: string): Promise<boolean> {
  return await sendEmail({
    to,
    subject: "Test Email from Samrudhi Trust",
    html: `
      <h1>Test Email</h1>
      <p>This is a test email from Samrudhi Trust email system.</p>
      <p>If you received this, the email configuration is working correctly!</p>
    `,
  });
}

// Export individual email sending functions
export * from "./emailHelpers";

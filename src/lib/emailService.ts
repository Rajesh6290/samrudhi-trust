import nodemailer from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import connectDB from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";
import Member from "@/models/Member";
import { getBaseUrl } from "@/lib/getBaseUrl";

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
    host: process.env.NEXT_PUBLIC_SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.NEXT_PUBLIC_SMTP_PORT || "587"),
    secure: process.env.NEXT_PUBLIC_SMTP_SECURE === "true",
    auth: {
      user: process.env.NEXT_PUBLIC_SMTP_USER,
      pass: process.env.NEXT_PUBLIC_SMTP_PASS,
    },
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 15000, // 15 seconds
    socketTimeout: 30000, // 30 seconds
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

    console.warn("Sending email:", {
      to: mailOptions.to,
      subject: mailOptions.subject,
      hasAttachments: !!options.attachments,
      attachmentCount: options.attachments?.length || 0,
      attachmentDetails: options.attachments?.map((a) => ({
        filename: a.filename,
        size: a.content instanceof Buffer ? a.content.length : "unknown",
      })),
    });

    await transporter.sendMail(mailOptions);
    console.warn("Email sent successfully to:", mailOptions.to);
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
    // Dynamic import puppeteer-core and chromium for serverless compatibility
    const puppeteer = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium-min");
    const { invoice } = await import("@/features/templates/invoice");

    // Fetch organization and chairman data from database
    await connectDB();
    const settings = await SiteSettings.findOne();
    const chairman = await Member.findOne({
      role: { $regex: /chairman/i },
      isActive: true,
    }).sort({ createdAt: 1 });

    // Prepare invoice data
    const baseUrl =
      getBaseUrl() ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://samriddhisevatrust.org";
    const logoUrl = `${baseUrl}/logo.svg`;

    const invoiceData = {
      organizationName: settings?.organizationName || "Samriddhi Seva Trust",
      organizationEmail: settings?.email || "info@samriddhisevatrust.org",
      organizationPhone: settings?.phone || "+91 1234567890",
      organizationAddress: settings?.address || "India",
      organizationPan: settings?.pan || "AABTI1433N",
      organizationGstin: settings?.gstin || undefined,
      chairmanName: chairman?.name || "Authorized Signatory",
      chairmanPhoto: chairman?.photo || "",
      logoUrl,
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

    // Generate PDF using puppeteer-core with chromium
    // Use different Chrome for local vs production
    const isProduction = process.env.NODE_ENV === "production";

    const browser = await puppeteer.launch({
      args: isProduction
        ? [...chromium.default.args, "--disable-dev-shm-usage"]
        : ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: isProduction
        ? await chromium.default.executablePath()
        : process.platform === "darwin"
          ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          : process.platform === "win32"
            ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            : "/usr/bin/google-chrome",
      headless: true,
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
    // Dynamic import puppeteer-core and chromium for serverless compatibility
    const puppeteer = await import("puppeteer-core");
    const chromium = await import("@sparticuz/chromium-min");
    const { invoice80GTemplate } = await import("@/features/templates/80G");

    // Fetch organization and chairman data from database
    await connectDB();
    const settings = await SiteSettings.findOne();
    const chairman = await Member.findOne({
      role: { $regex: /chairman/i },
      isActive: true,
    }).sort({ createdAt: 1 });

    // Prepare 80G certificate data
    const baseUrl =
      getBaseUrl() ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "https://samriddhisevatrust.org";
    const logoUrl = `${baseUrl}/logo.svg`;

    const certificateData = {
      organizationName: settings?.organizationName || "Samriddhi Seva Trust",
      organizationEmail: settings?.email || "info@samriddhisevatrust.org",
      organizationPhone: settings?.phone || "+91 1234567890",
      organizationAddress: settings?.address || "India",
      organizationPan: settings?.pan || "AABTI1433N",
      organizationGstin: settings?.gstin || undefined,
      chairmanName: chairman?.name || "Authorized Signatory",
      chairmanPhoto: chairman?.photo || "",
      logoUrl,
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

    // Generate PDF using puppeteer-core with chromium
    // Use different Chrome for local vs production
    const isProduction = process.env.NODE_ENV === "production";

    const browser = await puppeteer.launch({
      args: isProduction
        ? [...chromium.default.args, "--disable-dev-shm-usage"]
        : ["--no-sandbox", "--disable-setuid-sandbox"],
      executablePath: isProduction
        ? await chromium.default.executablePath()
        : process.platform === "darwin"
          ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          : process.platform === "win32"
            ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            : "/usr/bin/google-chrome",
      headless: true,
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

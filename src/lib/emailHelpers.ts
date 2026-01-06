import {
  sendEmail,
  sendPaymentReceiptEmail,
  sendBulkEmails,
} from "./emailService";
import {
  getWelcomeEmailTemplate,
  getAdminRegistrationNotificationTemplate,
  getAdminCredentialsTemplate,
  getPasswordResetTemplate,
} from "@/features/templates/authTemplates";
import {
  getPaymentSuccessTemplate,
  getPaymentFailedTemplate,
  getPaymentRefundTemplate,
  getMonthlyDonationReceiptTemplate,
} from "@/features/templates/paymentTemplates";
import {
  getCampaignLaunchTemplate,
  getVolunteerOpportunityTemplate,
  getNewsletterTemplate,
  getCertificateGeneratedTemplate,
  getContactFormNotificationTemplate,
} from "@/features/templates/notificationTemplates";

/**
 * Email Helper Functions
 * High-level functions for sending specific types of emails
 */

// ==================== AUTHENTICATION EMAILS ====================

export async function sendWelcomeEmail(
  name: string,
  email: string
): Promise<boolean> {
  const html = getWelcomeEmailTemplate(name, email);
  return await sendEmail({
    to: email,
    subject: "Welcome to Samriddhi Seva Trust!",
    html,
  });
}

export async function sendAdminCreatedNotification(
  adminName: string,
  adminEmail: string,
  adminRole: string,
  createdBy: string,
  superadminEmail: string
): Promise<boolean> {
  const html = getAdminRegistrationNotificationTemplate(
    adminName,
    adminEmail,
    adminRole,
    createdBy
  );
  return await sendEmail({
    to: superadminEmail,
    subject: "New Admin Account Created",
    html,
  });
}

export async function sendAdminCredentials(
  adminName: string,
  adminEmail: string,
  tempPassword: string,
  adminRole: string
): Promise<boolean> {
  const html = getAdminCredentialsTemplate(
    adminName,
    adminEmail,
    tempPassword,
    adminRole
  );
  return await sendEmail({
    to: adminEmail,
    subject: "Your Admin Account Credentials - Samriddhi Seva Trust",
    html,
  });
}

export async function sendPasswordResetEmail(
  name: string,
  email: string,
  resetToken: string
): Promise<boolean> {
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
  const html = getPasswordResetTemplate(name, resetLink);
  return await sendEmail({
    to: email,
    subject: "Reset Your Password - Samriddhi Seva Trust",
    html,
  });
}

// ==================== PAYMENT EMAILS ====================

export async function sendPaymentSuccessEmail(paymentDetails: {
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
  purpose: string;
  paymentMethod: string;
  transactionDate: string;
  receiptNumber?: string;
  tax80G?: boolean;
}): Promise<boolean> {
  const html = getPaymentSuccessTemplate(paymentDetails);
  return await sendPaymentReceiptEmail(paymentDetails, html);
}

export async function sendPaymentFailedEmail(
  donorName: string,
  donorEmail: string,
  amount: number,
  orderId: string,
  reason?: string
): Promise<boolean> {
  const html = getPaymentFailedTemplate(donorName, amount, orderId, reason);
  return await sendEmail({
    to: donorEmail,
    subject: "Payment Failed - Samriddhi Seva Trust",
    html,
  });
}

export async function sendPaymentRefundEmail(
  donorName: string,
  donorEmail: string,
  amount: number,
  paymentId: string,
  refundReason: string
): Promise<boolean> {
  const html = getPaymentRefundTemplate(
    donorName,
    amount,
    paymentId,
    refundReason
  );
  return await sendEmail({
    to: donorEmail,
    subject: "Refund Processed - Samriddhi Seva Trust",
    html,
  });
}

export async function sendMonthlyDonationReceipt(
  donorName: string,
  donorEmail: string,
  month: string,
  year: number,
  transactions: Array<{ date: string; amount: number; purpose: string }>
): Promise<boolean> {
  const html = getMonthlyDonationReceiptTemplate(
    donorName,
    month,
    year,
    transactions
  );
  return await sendEmail({
    to: donorEmail,
    subject: `Monthly Donation Summary - ${month} ${year}`,
    html,
  });
}

// ==================== NOTIFICATION EMAILS ====================

export async function sendCampaignLaunchEmail(
  recipients: string[],
  campaignName: string,
  description: string,
  targetAmount: number,
  endDate: string,
  imageUrl?: string
): Promise<{ success: number; failed: number }> {
  const html = getCampaignLaunchTemplate(
    campaignName,
    description,
    targetAmount,
    endDate,
    imageUrl
  );
  return await sendBulkEmails(
    recipients,
    `New Campaign: ${campaignName}`,
    html
  );
}

export async function sendVolunteerOpportunityEmail(
  recipientName: string,
  recipientEmail: string,
  opportunityTitle: string,
  description: string,
  date: string,
  location: string
): Promise<boolean> {
  const html = getVolunteerOpportunityTemplate(
    recipientName,
    opportunityTitle,
    description,
    date,
    location
  );
  return await sendEmail({
    to: recipientEmail,
    subject: `Volunteer Opportunity: ${opportunityTitle}`,
    html,
  });
}

export async function sendNewsletterEmail(
  recipients: string[],
  subject: string,
  htmlContent: string
): Promise<{ success: number; failed: number }> {
  const html = getNewsletterTemplate(subject, htmlContent);
  return await sendBulkEmails(recipients, subject, html);
}

export async function sendCertificateGeneratedEmail(
  recipientName: string,
  recipientEmail: string,
  certificateType: string,
  certificateNumber: string,
  issuedDate: string
): Promise<boolean> {
  const html = getCertificateGeneratedTemplate(
    recipientName,
    certificateType,
    certificateNumber,
    issuedDate
  );
  return await sendEmail({
    to: recipientEmail,
    subject: "Your Certificate is Ready - Samriddhi Seva Trust",
    html,
  });
}

export async function sendContactFormNotification(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string,
  adminEmails: string[]
): Promise<boolean> {
  const html = getContactFormNotificationTemplate(
    name,
    email,
    phone,
    subject,
    message
  );
  return await sendEmail({
    to: adminEmails,
    subject: `New Contact Form: ${subject}`,
    html,
    replyTo: email,
  });
}

// ==================== ADMIN NOTIFICATION EMAILS ====================

export async function sendAdminAlert(
  adminEmails: string[],
  alertTitle: string,
  alertMessage: string,
  severity: "info" | "warning" | "error" = "info"
): Promise<boolean> {
  const severityColors = {
    info: "#0dcaf0",
    warning: "#ffc107",
    error: "#dc3545",
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .alert { padding: 20px; border-left: 4px solid ${severityColors[severity]}; background-color: #f8f9fa; }
      </style>
    </head>
    <body>
      <div class="alert">
        <h2>${alertTitle}</h2>
        <p>${alertMessage}</p>
        <p><small>Time: ${new Date().toLocaleString()}</small></p>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: adminEmails,
    subject: `[${severity.toUpperCase()}] ${alertTitle}`,
    html,
  });
}

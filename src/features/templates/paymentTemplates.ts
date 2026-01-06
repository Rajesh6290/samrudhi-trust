import { getBaseEmailTemplate } from "./baseTemplate";

interface PaymentDetails {
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
}

/**
 * Payment Success Email Template
 * Sent when payment is successful
 */
export function getPaymentSuccessTemplate(details: PaymentDetails): string {
  const content = `
    <h1 style="color: #28a745; margin-bottom: 20px;">✅ Payment Successful!</h1>
    
    <p>Dear ${details.donorName},</p>
    
    <p>Thank you for your generous contribution to Samrudhi Trust! Your payment has been processed successfully.</p>
    
    <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #155724;">Payment Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #155724;"><strong>Receipt Number:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${details.receiptNumber || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #155724;"><strong>Transaction ID:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${details.paymentId}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #155724;"><strong>Order ID:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-family: monospace; font-size: 12px;">${details.orderId}</td>
        </tr>
        <tr style="border-top: 1px solid #c3e6cb;">
          <td style="padding: 8px 0; color: #155724;"><strong>Amount:</strong></td>
          <td style="padding: 8px 0; text-align: right; font-size: 18px; font-weight: bold; color: #28a745;">${details.currency} ${details.amount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #155724;"><strong>Purpose:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${details.purpose}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #155724;"><strong>Payment Method:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${details.paymentMethod}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #155724;"><strong>Date:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${details.transactionDate}</td>
        </tr>
      </table>
    </div>
    
    ${
      details.tax80G
        ? `
    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;"><strong>📄 80G Tax Exemption Certificate</strong></p>
      <p style="margin: 10px 0 0 0; color: #856404;">Your 80G certificate is attached with this email. You can claim tax deduction under Section 80G of the Income Tax Act.</p>
    </div>
    `
        : ""
    }
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/payment?receiptNumber=${details.receiptNumber}" class="button">
        Download Receipt
      </a>
    </div>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Your Impact</h3>
      <p style="margin: 5px 0;">Your contribution helps us continue our mission of empowering communities and transforming lives. Every donation makes a real difference!</p>
    </div>
    
    <p><strong>What Happens Next?</strong></p>
    <ul style="line-height: 1.8;">
      <li>Your receipt and tax certificate are attached to this email</li>
      <li>You can view your donation history anytime on our website</li>
      <li>We'll keep you updated on how your contribution is making an impact</li>
    </ul>
    
    <p style="margin-top: 30px;">
      With heartfelt gratitude,<br>
      <strong>The Samriddhi Seva Trust Team</strong>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Payment Successful - Thank You!",
    content,
    preheader: `Payment of ${details.currency} ${details.amount.toLocaleString()} received successfully`,
    footerText: "Your generosity changes lives!",
  });
}

/**
 * Payment Failed Email Template
 */
export function getPaymentFailedTemplate(
  donorName: string,
  amount: number,
  orderId: string,
  reason?: string
): string {
  const content = `
    <h1 style="color: #dc3545; margin-bottom: 20px;">❌ Payment Failed</h1>
    
    <p>Dear ${donorName},</p>
    
    <p>Unfortunately, your payment could not be processed. Please don't worry - no amount has been deducted from your account.</p>
    
    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #721c24;">Transaction Details</h3>
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
      <p style="margin: 5px 0;"><strong>Amount:</strong> ₹${amount.toLocaleString()}</p>
      ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ""}
    </div>
    
    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;"><strong>💡 Common Reasons:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px; color: #856404;">
        <li>Insufficient funds</li>
        <li>Incorrect card details</li>
        <li>Network issues</li>
        <li>Bank declined the transaction</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/donation" class="button">
        Try Again
      </a>
    </div>
    
    <p>If you continue to experience issues, please contact your bank or try a different payment method.</p>
    
    <p style="margin-top: 30px;">
      Need help?<br>
      <strong>Contact our support team</strong>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Payment Failed",
    content,
    preheader: "Your payment could not be processed",
  });
}

/**
 * Payment Refund Email Template
 */
export function getPaymentRefundTemplate(
  donorName: string,
  amount: number,
  paymentId: string,
  refundReason: string
): string {
  const content = `
    <h1 style="color: #ffc107; margin-bottom: 20px;">↩️ Refund Processed</h1>
    
    <p>Dear ${donorName},</p>
    
    <p>A refund has been initiated for your payment. The amount will be credited to your original payment method within 5-7 business days.</p>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #856404;">Refund Details</h3>
      <p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${paymentId}</p>
      <p style="margin: 5px 0;"><strong>Refund Amount:</strong> ₹${amount.toLocaleString()}</p>
      <p style="margin: 5px 0;"><strong>Reason:</strong> ${refundReason}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div style="background-color: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #0c5460;"><strong>📝 Important Information:</strong></p>
      <ul style="margin: 10px 0; padding-left: 20px; color: #0c5460;">
        <li>Refund processing time: 5-7 business days</li>
        <li>The amount will be credited to your original payment method</li>
        <li>You'll receive a notification once the refund is complete</li>
      </ul>
    </div>
    
    <p>If you have any questions about this refund, please contact our support team.</p>
  `;

  return getBaseEmailTemplate({
    title: "Refund Processed",
    content,
    preheader: `Refund of ₹${amount.toLocaleString()} initiated`,
  });
}

/**
 * Monthly Donation Receipt Email Template
 */
export function getMonthlyDonationReceiptTemplate(
  donorName: string,
  month: string,
  year: number,
  transactions: Array<{ date: string; amount: number; purpose: string }>
): string {
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  const transactionRows = transactions
    .map(
      (t) => `
    <tr style="border-bottom: 1px solid #e9ecef;">
      <td style="padding: 12px 8px;">${t.date}</td>
      <td style="padding: 12px 8px;">${t.purpose}</td>
      <td style="padding: 12px 8px; text-align: right; font-weight: bold;">₹${t.amount.toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">📊 Monthly Donation Summary</h1>
    
    <p>Dear ${donorName},</p>
    
    <p>Thank you for your continued support! Here's a summary of your donations for <strong>${month} ${year}</strong>.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #667eea; color: white;">
            <th style="padding: 12px 8px; text-align: left;">Date</th>
            <th style="padding: 12px 8px; text-align: left;">Purpose</th>
            <th style="padding: 12px 8px; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${transactionRows}
        </tbody>
        <tfoot>
          <tr style="background-color: #e9ecef; font-weight: bold;">
            <td colspan="2" style="padding: 15px 8px;">Total Donations</td>
            <td style="padding: 15px 8px; text-align: right; font-size: 18px; color: #28a745;">₹${totalAmount.toLocaleString()}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/members/payments" class="button">
        View Full History
      </a>
    </div>
    
    <p style="color: #667eea; font-size: 18px; font-weight: bold; text-align: center; margin: 30px 0;">
      Together, we've made a difference of ₹${totalAmount.toLocaleString()} this month! 🎉
    </p>
  `;

  return getBaseEmailTemplate({
    title: `Donation Summary - ${month} ${year}`,
    content,
    preheader: `Your donation summary for ${month} ${year}`,
  });
}

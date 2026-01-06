import { getBaseEmailTemplate } from "./baseTemplate";

/**
 * Campaign Launch Notification Template
 */
export function getCampaignLaunchTemplate(
  campaignName: string,
  description: string,
  targetAmount: number,
  endDate: string,
  imageUrl?: string
): string {
  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">🚀 New Campaign Launched!</h1>
    
    ${
      imageUrl
        ? `
    <div style="text-align: center; margin: 20px 0;">
      <img src="${imageUrl}" alt="${campaignName}" style="max-width: 100%; height: auto; border-radius: 8px;" />
    </div>
    `
        : ""
    }
    
    <h2 style="color: #667eea;">${campaignName}</h2>
    
    <p>${description}</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0;"><strong>Target Amount:</strong></td>
          <td style="text-align: right; font-size: 20px; color: #28a745; font-weight: bold;">₹${targetAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Campaign Ends:</strong></td>
          <td style="text-align: right; color: #dc3545;">${endDate}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/campaign" class="button">
        Support This Campaign
      </a>
    </div>
    
    <p>Every contribution, no matter how small, brings us closer to our goal. Together, we can make this campaign a success!</p>
  `;

  return getBaseEmailTemplate({
    title: "New Campaign Launched",
    content,
    preheader: `${campaignName} - Join us in making a difference`,
  });
}

/**
 * Volunteer Opportunity Template
 */
export function getVolunteerOpportunityTemplate(
  recipientName: string,
  opportunityTitle: string,
  description: string,
  date: string,
  location: string
): string {
  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">🤝 Volunteer Opportunity</h1>
    
    <p>Dear ${recipientName},</p>
    
    <p>We have an exciting volunteer opportunity that matches your interests!</p>
    
    <div style="background-color: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #1976D2;">${opportunityTitle}</h3>
      <p style="margin: 10px 0;">${description}</p>
      <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
      <p style="margin: 5px 0;"><strong>📍 Location:</strong> ${location}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/volunteer" class="button">
        Register Now
      </a>
    </div>
    
    <p>We look forward to seeing you there!</p>
  `;

  return getBaseEmailTemplate({
    title: "Volunteer Opportunity",
    content,
    preheader: `${opportunityTitle} - Join us!`,
  });
}

/**
 * Newsletter Template
 */
export function getNewsletterTemplate(
  subject: string,
  htmlContent: string
): string {
  const content = `
    <div style="line-height: 1.8;">
      ${htmlContent}
    </div>
  `;

  return getBaseEmailTemplate({
    title: subject,
    content,
    preheader: subject,
  });
}

/**
 * Certificate Generated Template
 */
export function getCertificateGeneratedTemplate(
  recipientName: string,
  certificateType: string,
  certificateNumber: string,
  issuedDate: string
): string {
  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">🏆 Certificate Generated</h1>
    
    <p>Dear ${recipientName},</p>
    
    <p>Congratulations! Your certificate has been generated and is ready to download.</p>
    
    <div style="background-color: #fff8dc; border: 2px solid #ffd700; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
      <h3 style="margin-top: 0; color: #b8860b;">Certificate of ${certificateType}</h3>
      <p style="margin: 10px 0; font-size: 18px;"><strong>Certificate Number:</strong></p>
      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #667eea; font-family: monospace;">${certificateNumber}</p>
      <p style="margin: 15px 0 0 0; color: #666;"><strong>Issued Date:</strong> ${issuedDate}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/certificates/${certificateNumber}" class="button">
        Download Certificate
      </a>
    </div>
    
    <p>Thank you for your valuable contribution to Samriddhi Seva Trust!</p>
  `;

  return getBaseEmailTemplate({
    title: "Certificate Generated",
    content,
    preheader: "Your certificate is ready",
  });
}

/**
 * Contact Form Submission Template (Admin Notification)
 */
export function getContactFormNotificationTemplate(
  name: string,
  email: string,
  phone: string,
  subject: string,
  message: string
): string {
  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">📬 New Contact Form Submission</h1>
    
    <p>A new inquiry has been received through the contact form.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Contact Details</h3>
      <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
      <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>
      <p style="margin: 8px 0;"><strong>Subject:</strong> ${subject}</p>
    </div>
    
    <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h4 style="margin-top: 0;">Message:</h4>
      <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="mailto:${email}" class="button">
        Reply to Inquiry
      </a>
    </div>
  `;

  return getBaseEmailTemplate({
    title: "New Contact Form Submission",
    content,
    preheader: `New inquiry from ${name}`,
  });
}

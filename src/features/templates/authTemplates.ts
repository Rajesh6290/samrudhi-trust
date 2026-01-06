import { getBaseEmailTemplate } from "./baseTemplate";

/**
 * Welcome Email Template
 * Sent when a new user registers
 */
export function getWelcomeEmailTemplate(name: string, email: string): string {
  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">Welcome to Samriddhi Seva Trust! 🎉</h1>
    
    <p>Dear ${name},</p>
    
    <p>Thank you for joining Samriddhi Seva Trust! We're thrilled to have you as part of our community dedicated to making a positive impact.</p>
    
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #667eea;">Your Account Details</h3>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
    </div>
    
    <p><strong>What's Next?</strong></p>
    <ul style="line-height: 1.8;">
      <li>Complete your profile to personalize your experience</li>
      <li>Explore our ongoing campaigns and projects</li>
      <li>Subscribe to our newsletter for updates</li>
      <li>Join our volunteer programs</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" class="button">
        Get Started
      </a>
    </div>
    
    <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team.</p>
    
    <p style="margin-top: 30px;">
      Warm regards,<br>
      <strong>The Samriddhi Seva Trust Team</strong>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Welcome to Samriddhi Seva Trust",
    content,
    preheader: "Welcome to our community!",
    footerText: "Together, we make a difference!",
  });
}

/**
 * Admin Registration Notification Template
 * Sent to superadmin when a new admin is created
 */
export function getAdminRegistrationNotificationTemplate(
  adminName: string,
  adminEmail: string,
  adminRole: string,
  createdBy: string
): string {
  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">🔔 New Admin Account Created</h1>
    
    <p>A new admin account has been created in the system.</p>
    
    <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #856404;">Admin Details</h3>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${adminName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${adminEmail}</p>
      <p style="margin: 5px 0;"><strong>Role:</strong> <span style="text-transform: uppercase; background-color: #667eea; color: white; padding: 3px 10px; border-radius: 4px; font-size: 12px;">${adminRole}</span></p>
      <p style="margin: 5px 0;"><strong>Created By:</strong> ${createdBy}</p>
      <p style="margin: 5px 0;"><strong>Created At:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/admins" class="button">
        View Admin Panel
      </a>
    </div>
    
    <p style="color: #dc3545; font-weight: bold;">⚠️ Security Note:</p>
    <p>Please verify this action if you did not authorize it. If this was unauthorized, please take immediate action.</p>
  `;

  return getBaseEmailTemplate({
    title: "New Admin Account Created",
    content,
    preheader: "Admin account notification",
  });
}

/**
 * Admin Credentials Email Template
 * Sent to new admin with login credentials
 */
export function getAdminCredentialsTemplate(
  adminName: string,
  adminEmail: string,
  tempPassword: string,
  adminRole: string
): string {
  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">🔑 Your Admin Account is Ready</h1>
    
    <p>Dear ${adminName},</p>
    
    <p>Your administrator account has been created for Samriddhi Seva Trust's admin panel.</p>
    
    <div style="background-color: #d1ecf1; border-left: 4px solid #0c5460; padding: 20px; margin: 25px 0;">
      <h3 style="margin-top: 0; color: #0c5460;">Login Credentials</h3>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${adminEmail}</p>
      <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background-color: #fff; padding: 5px 10px; border-radius: 4px; font-size: 14px;">${tempPassword}</code></p>
      <p style="margin: 5px 0;"><strong>Role:</strong> ${adminRole}</p>
    </div>
    
    <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;"><strong>🔒 Security Instructions:</strong></p>
      <ol style="margin: 10px 0; padding-left: 20px; color: #856404;">
        <li>Login with the temporary password provided above</li>
        <li>Change your password immediately after first login</li>
        <li>Do not share your credentials with anyone</li>
        <li>Use a strong, unique password</li>
      </ol>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" class="button">
        Login to Admin Panel
      </a>
    </div>
    
    <p>If you have any questions or issues accessing your account, please contact the system administrator.</p>
    
    <p style="margin-top: 30px;">
      Best regards,<br>
      <strong>Samriddhi Seva Trust Admin Team</strong>
    </p>
  `;

  return getBaseEmailTemplate({
    title: "Admin Account Credentials",
    content,
    preheader: "Your admin account is ready",
  });
}

/**
 * Password Reset Template
 */
export function getPasswordResetTemplate(
  name: string,
  resetLink: string
): string {
  const content = `
    <h1 style="color: #333; margin-bottom: 20px;">🔐 Reset Your Password</h1>
    
    <p>Dear ${name},</p>
    
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="button">
        Reset Password
      </a>
    </div>
    
    <div style="background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #721c24;"><strong>⚠️ Important:</strong></p>
      <p style="margin: 5px 0 0 0; color: #721c24;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.</p>
    </div>
    
    <p style="font-size: 14px; color: #6c757d;">For security reasons, this link can only be used once.</p>
  `;

  return getBaseEmailTemplate({
    title: "Reset Your Password",
    content,
    preheader: "Reset your password",
  });
}

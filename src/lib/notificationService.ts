import connectDB from "./mongodb";
import Notification from "@/models/Notification";

export interface CreateNotificationParams {
  userRole?: string;
  type:
    | "payment"
    | "donation"
    | "campaign"
    | "volunteer"
    | "member"
    | "system"
    | "approval"
    | "alert"
    | "reminder"
    | "other";
  title: string;
  message: string;
  priority?: "low" | "medium" | "high" | "urgent";
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a system notification for admins
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    await connectDB();

    const notification = await Notification.create({
      userRole: params.userRole || "all",
      type: params.type,
      title: params.title,
      message: params.message,
      priority: params.priority || "medium",
      link: params.link,
      metadata: params.metadata,
      isRead: false,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}

/**
 * Create notification for new member registration
 */
export async function notifyNewMember(
  memberName: string,
  memberEmail: string,
  memberId: string
) {
  return createNotification({
    userRole: "all",
    type: "member",
    title: "New Member Registered",
    message: `${memberName} (${memberEmail}) has registered as a new member.`,
    priority: "medium",
    link: `/admin/members`,
    metadata: { memberId, memberName, memberEmail },
  });
}

/**
 * Create notification for new payment
 */
export async function notifyNewPayment(
  amount: number,
  donor: string,
  paymentMethod: string,
  paymentId: string
) {
  return createNotification({
    userRole: "all",
    type: "payment",
    title: "New Payment Received",
    message: `Payment of ₹${amount.toLocaleString("en-IN")} received from ${donor} via ${paymentMethod}.`,
    priority: "high",
    link: `/admin/payments`,
    metadata: { paymentId, amount, donor, paymentMethod },
  });
}

/**
 * Create notification for new volunteer
 */
export async function notifyNewVolunteer(
  volunteerName: string,
  volunteerEmail: string,
  volunteerId: string
) {
  return createNotification({
    userRole: "all",
    type: "volunteer",
    title: "New Volunteer Application",
    message: `${volunteerName} (${volunteerEmail}) has applied to become a volunteer.`,
    priority: "medium",
    link: `/admin/volunteers`,
    metadata: { volunteerId, volunteerName, volunteerEmail },
  });
}

/**
 * Create notification for new admin login
 */
export async function notifyAdminLogin(
  adminName: string,
  adminEmail: string,
  ipAddress?: string
) {
  return createNotification({
    userRole: "superadmin",
    type: "system",
    title: "Admin Login",
    message: `${adminName} (${adminEmail}) logged in to the admin panel.${ipAddress ? ` IP: ${ipAddress}` : ""}`,
    priority: "low",
    link: `/admin/audit-logs`,
    metadata: { adminName, adminEmail, ipAddress },
  });
}

/**
 * Create notification for new admin created
 */
export async function notifyNewAdmin(
  newAdminName: string,
  newAdminEmail: string,
  role: string,
  createdBy: string
) {
  return createNotification({
    userRole: "superadmin",
    type: "system",
    title: "New Admin Created",
    message: `${newAdminName} (${newAdminEmail}) was added as ${role} by ${createdBy}.`,
    priority: "high",
    link: `/admin/admins`,
    metadata: { newAdminName, newAdminEmail, role, createdBy },
  });
}

/**
 * Create notification for new campaign
 */
export async function notifyNewCampaign(
  campaignTitle: string,
  campaignId: string
) {
  return createNotification({
    userRole: "all",
    type: "campaign",
    title: "New Campaign Created",
    message: `Campaign "${campaignTitle}" has been created and is now active.`,
    priority: "medium",
    link: `/admin/campaigns`,
    metadata: { campaignTitle, campaignId },
  });
}

/**
 * Create notification for payment approval needed
 */
export async function notifyPaymentApprovalNeeded(
  amount: number,
  donor: string,
  paymentId: string
) {
  return createNotification({
    userRole: "admin",
    type: "approval",
    title: "Payment Approval Required",
    message: `Payment of ₹${amount.toLocaleString("en-IN")} from ${donor} requires approval.`,
    priority: "urgent",
    link: `/admin/payments`,
    metadata: { paymentId, amount, donor },
  });
}

/**
 * Create notification for low stock/resources
 */
export async function notifyLowResources(
  resourceName: string,
  quantity: number
) {
  return createNotification({
    userRole: "admin",
    type: "alert",
    title: "Low Resources Alert",
    message: `${resourceName} is running low. Current quantity: ${quantity}.`,
    priority: "high",
    link: `/admin/dashboard`,
    metadata: { resourceName, quantity },
  });
}

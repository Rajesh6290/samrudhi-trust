/**
 * RBAC (Role-Based Access Control) Utilities
 * Handles permission checking for admin features
 */

export type UserRole = "superadmin" | "admin" | "subadmin" | "user";

export const PERMISSIONS = {
  DASHBOARD: "dashboard",
  MEMBERS: "members",
  SERVICES: "services",
  CAMPAIGNS: "campaigns",
  VOLUNTEERS: "volunteers",
  BLOGS: "blogs",
  STATS: "stats",
  TESTIMONIALS: "testimonials",
  GALLERY: "gallery",
  CERTIFICATES: "certificates",
  CONTENT: "content",
  FEEDBACK: "feedback",
  CONTACT: "contact",
  FAQS: "faqs",
  PAYMENTS: "payments",
  SETTINGS: "settings",
  ADMINS: "admins",
  AUDIT_LOGS: "audit_logs",
  PROFILE: "profile",
  NEWSLETTER: "newsletter",
  NOTIFICATIONS: "notifications",
  BLOG_COMMENTS: "blog_comments",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: string[],
  requiredPermission: string,
  userRole?: UserRole
): boolean {
  // Superadmin has all permissions
  if (userRole === "superadmin") return true;

  // Check if user has the specific permission
  return userPermissions.includes(requiredPermission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  requiredPermissions: string[],
  userRole?: UserRole
): boolean {
  // Superadmin has all permissions
  if (userRole === "superadmin") return true;

  // Check if user has any of the permissions
  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  requiredPermissions: string[],
  userRole?: UserRole
): boolean {
  // Superadmin has all permissions
  if (userRole === "superadmin") return true;

  // Check if user has all permissions
  return requiredPermissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Check if user has the required role
 */
export function hasRole(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  return requiredRoles.includes(userRole);
}

/**
 * Get all available permissions
 */
export function getAllPermissions(): string[] {
  return Object.values(PERMISSIONS);
}

/**
 * Check if user can manage admins
 */
export function canManageAdmins(userRole: UserRole): boolean {
  return ["superadmin", "admin"].includes(userRole);
}

/**
 * Check if user can access admin panel
 */
export function canAccessAdminPanel(userRole: UserRole): boolean {
  return ["superadmin", "admin", "subadmin"].includes(userRole);
}

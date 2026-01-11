import { NextRequest, NextResponse } from "next/server";
import { logAuditAction, getRequestMetadata } from "./auditLogger";
import { checkAuth } from "./auth-middleware";

interface AuditConfig {
  module: string;
  action: string;
  entityType: string;
  skipAuth?: boolean; // For public endpoints
  extractEntityInfo?: (
    request: NextRequest,
    response: NextResponse
  ) => {
    entityId?: string;
    entityName?: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Wrapper to automatically log API actions
 * Usage: wrap your API handler with this function
 */
export function withAuditLog(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>,
  config: AuditConfig
) {
  return async (request: NextRequest, context?: unknown) => {
    const startTime = Date.now();
    let response: NextResponse;
    let userId = "anonymous";
    let userName = "Anonymous User";
    let userEmail = "anonymous@system";
    let status: "success" | "failed" = "success";
    let errorMessage: string | undefined;

    try {
      // Try to get user info if not skipping auth
      if (!config.skipAuth) {
        const { user } = await checkAuth(request);
        if (user) {
          userId = user._id;
          userName = user.name;
          userEmail = user.email;
        }
      }

      // Execute the actual handler
      response = await handler(request, context);

      // Check if response indicates failure
      const responseClone = response.clone();
      try {
        const body = await responseClone.json();
        if (!body.success || response.status >= 400) {
          status = "failed";
          errorMessage = body.error || body.message || "Unknown error";
        }
      } catch (_e) {
        // Response is not JSON, check status code
        if (response.status >= 400) {
          status = "failed";
          errorMessage = `HTTP ${response.status}`;
        }
      }

      // Extract entity info if provided
      let entityId: string | undefined;
      let entityName: string | undefined;
      let metadata: Record<string, unknown> | undefined;

      if (config.extractEntityInfo) {
        const extracted = config.extractEntityInfo(request, response);
        entityId = extracted.entityId;
        entityName = extracted.entityName;
        metadata = extracted.metadata;
      }

      // Get request metadata
      const requestMetadata = getRequestMetadata(request);

      // Log the action
      await logAuditAction({
        userId,
        userName,
        userEmail,
        action: config.action,
        module: config.module,
        entityType: config.entityType,
        entityId,
        entityName,
        ipAddress: requestMetadata.ipAddress,
        userAgent: requestMetadata.userAgent,
        status,
        errorMessage,
        metadata: {
          ...metadata,
          method: request.method,
          path: request.nextUrl.pathname,
          duration: Date.now() - startTime,
        },
      });

      return response;
    } catch (error: unknown) {
      status = "failed";
      errorMessage =
        error instanceof Error ? error.message : "Internal server error";

      // Still log the failed attempt
      const requestMetadata = getRequestMetadata(request);
      await logAuditAction({
        userId,
        userName,
        userEmail,
        action: config.action,
        module: config.module,
        entityType: config.entityType,
        ipAddress: requestMetadata.ipAddress,
        userAgent: requestMetadata.userAgent,
        status,
        errorMessage,
        metadata: {
          method: request.method,
          path: request.nextUrl.pathname,
          duration: Date.now() - startTime,
        },
      });

      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Helper to create audit log for bulk operations
 */
export async function logBulkAction(
  user: { _id: string; name: string; email: string },
  action: string,
  module: string,
  entityType: string,
  count: number,
  request: NextRequest,
  status: "success" | "failed" = "success",
  errorMessage?: string
) {
  const requestMetadata = getRequestMetadata(request);

  await logAuditAction({
    userId: user._id,
    userName: user.name,
    userEmail: user.email,
    action,
    module,
    entityType,
    ipAddress: requestMetadata.ipAddress,
    userAgent: requestMetadata.userAgent,
    status,
    errorMessage,
    metadata: {
      bulkOperation: true,
      count,
      method: request.method,
      path: request.nextUrl.pathname,
    },
  });
}

/**
 * Helper to map HTTP method to action
 */
export function getActionFromMethod(method: string): string {
  const methodMap: Record<string, string> = {
    GET: "fetch",
    POST: "create",
    PUT: "update",
    PATCH: "update",
    DELETE: "delete",
  };
  return methodMap[method.toUpperCase()] || "other";
}

/**
 * Helper to extract module from URL path
 */
export function getModuleFromPath(path: string): string {
  // Extract module from path like /api/members or /api/members/123
  const match = path.match(/\/api\/([^/]+)/);
  if (!match) return "other";

  const pathModule = match[1];

  // Map path segments to module names
  const moduleMap: Record<string, string> = {
    "blog-comments": "blog_comments",
    "audit-logs": "audit_logs",
    members: "members",
    payments: "payments",
    campaigns: "campaigns",
    volunteers: "volunteers",
    blogs: "blogs",
    gallery: "gallery",
    testimonials: "testimonials",
    services: "services",
    certificates: "certificates",
    content: "content",
    faqs: "faqs",
    feedback: "feedback",
    contact: "contact",
    settings: "settings",
    admin: "admins",
    stats: "stats",
    notifications: "notifications",
    newsletter: "newsletter",
    transactions: "transactions",
    payouts: "payouts",
    webhooks: "webhooks",
    upload: "upload",
    auth: "auth",
  };

  return moduleMap[pathModule] || "other";
}

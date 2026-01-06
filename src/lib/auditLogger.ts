import AuditLog from "@/models/AuditLog";
import connectDB from "./mongodb";

interface AuditLogParams {
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  module: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  status?: "success" | "failed";
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an admin action to the audit trail
 */
export async function logAuditAction(params: AuditLogParams): Promise<void> {
  try {
    await connectDB();

    await AuditLog.create({
      ...params,
      status: params.status || "success",
    });
  } catch (error) {
    console.error("Failed to log audit action:", error);
    // Don't throw error to prevent disrupting the main operation
  }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string;
  module?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}) {
  try {
    await connectDB();

    const {
      userId,
      module,
      action,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const query: any = {};

    if (userId) query.userId = userId;
    if (module) query.module = module;
    if (action) query.action = action;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [logs, total, availableModules, availableActions] = await Promise.all(
      [
        AuditLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AuditLog.countDocuments(query),
        AuditLog.distinct("module"),
        AuditLog.distinct("action"),
      ]
    );

    return {
      logs,
      availableModules: availableModules.sort(),
      availableActions: availableActions.sort(),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Failed to get audit logs:", error);
    throw error;
  }
}

/**
 * Compare two objects and generate change list
 */
export function generateChanges(
  oldData: any,
  newData: any,
  excludeFields: string[] = ["_id", "__v", "updatedAt", "createdAt"]
): { field: string; oldValue: any; newValue: any }[] {
  const changes: { field: string; oldValue: any; newValue: any }[] = [];

  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData || {}),
  ]);

  allKeys.forEach((key) => {
    if (excludeFields.includes(key)) return;

    const oldValue = oldData?.[key];
    const newValue = newData?.[key];

    // Check if values are different
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  });

  return changes;
}

/**
 * Get request metadata (IP, User Agent)
 */
export function getRequestMetadata(request: Request) {
  const ipAddress =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = request.headers.get("user-agent") || "unknown";

  return { ipAddress, userAgent };
}

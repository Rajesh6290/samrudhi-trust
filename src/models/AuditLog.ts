import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
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
  status: "success" | "failed";
  errorMessage?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "view",
        "export",
        "import",
        "approve",
        "reject",
        "publish",
        "unpublish",
        "send_email",
        "upload",
        "download",
        "mark_read",
        "verify",
        "cancel",
        "refund",
        "process",
        "send",
        "fetch",
        "bulk_create",
        "bulk_update",
        "bulk_delete",
        "other",
      ],
      index: true,
    },
    module: {
      type: String,
      required: true,
      enum: [
        "members",
        "payments",
        "donations",
        "campaigns",
        "volunteers",
        "blogs",
        "blog_comments",
        "gallery",
        "testimonials",
        "services",
        "certificates",
        "content",
        "faqs",
        "feedback",
        "contact",
        "settings",
        "admins",
        "stats",
        "emails",
        "notifications",
        "newsletter",
        "reports",
        "transactions",
        "payouts",
        "webhooks",
        "upload",
        "audit_logs",
        "auth",
        "other",
      ],
      index: true,
    },
    entityType: {
      type: String,
      required: true,
    },
    entityId: {
      type: String,
      index: true,
    },
    entityName: {
      type: String,
    },
    changes: [
      {
        field: String,
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
      },
    ],
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
      index: true,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for efficient queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLog;

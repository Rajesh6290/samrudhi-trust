import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;
  userRole?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  icon?: string;
  priority: "low" | "medium" | "high" | "urgent";
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    userRole: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "subadmin",
        "user",
        "member",
        "volunteer",
        "all",
      ],
      index: true,
    },
    type: {
      type: String,
      enum: [
        "payment",
        "donation",
        "campaign",
        "volunteer",
        "member",
        "system",
        "approval",
        "alert",
        "reminder",
        "other",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userRole: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", notificationSchema);

export default Notification;

import mongoose, { Schema, Document } from "mongoose";

export interface IEmailCampaign extends Document {
  name: string;
  subject: string;
  content: string;
  htmlContent?: string;
  recipientType:
    | "all"
    | "active_subscribers"
    | "members"
    | "volunteers"
    | "custom";
  customRecipients?: string[]; // Array of email addresses
  tags?: string[]; // Filter by tags
  status: "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed";
  scheduledAt?: Date;
  sentAt?: Date;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  bouncedCount: number;
  unsubscribedCount: number;
  failedCount: number;
  trackOpens: boolean;
  trackClicks: boolean;
  replyTo?: string;
  senderName?: string;
  attachments?: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }[];
  testEmails?: string[]; // For test sends
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Campaign name is required"],
      trim: true,
      maxlength: [200, "Campaign name cannot exceed 200 characters"],
    },
    subject: {
      type: String,
      required: [true, "Email subject is required"],
      trim: true,
      maxlength: [300, "Subject cannot exceed 300 characters"],
    },
    content: {
      type: String,
      required: [true, "Email content is required"],
    },
    htmlContent: {
      type: String,
    },
    recipientType: {
      type: String,
      enum: ["all", "active_subscribers", "members", "volunteers", "custom"],
      default: "active_subscribers",
      required: true,
    },
    customRecipients: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "scheduled", "sending", "sent", "paused", "failed"],
      default: "draft",
      required: true,
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    totalRecipients: {
      type: Number,
      default: 0,
      min: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    openedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    clickedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bouncedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    unsubscribedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    trackOpens: {
      type: Boolean,
      default: true,
    },
    trackClicks: {
      type: Boolean,
      default: true,
    },
    replyTo: {
      type: String,
      lowercase: true,
      trim: true,
    },
    senderName: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        fileName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileSize: { type: Number, required: true },
      },
    ],
    testEmails: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
EmailCampaignSchema.index({ status: 1, scheduledAt: 1 });
EmailCampaignSchema.index({ createdBy: 1, createdAt: -1 });
EmailCampaignSchema.index({ recipientType: 1 });
EmailCampaignSchema.index({ tags: 1 });

// Calculate open rate
EmailCampaignSchema.virtual("openRate").get(function (this: IEmailCampaign) {
  if (this.deliveredCount === 0) return 0;
  return ((this.openedCount / this.deliveredCount) * 100).toFixed(2);
});

// Calculate click rate
EmailCampaignSchema.virtual("clickRate").get(function (this: IEmailCampaign) {
  if (this.deliveredCount === 0) return 0;
  return ((this.clickedCount / this.deliveredCount) * 100).toFixed(2);
});

// Calculate delivery rate
EmailCampaignSchema.virtual("deliveryRate").get(function (
  this: IEmailCampaign
) {
  if (this.totalRecipients === 0) return 0;
  return ((this.deliveredCount / this.totalRecipients) * 100).toFixed(2);
});

export default mongoose.models.EmailCampaign ||
  mongoose.model<IEmailCampaign>("EmailCampaign", EmailCampaignSchema);

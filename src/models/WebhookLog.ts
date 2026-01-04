import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWebhookLog extends Document {
  eventType: string;
  payload: Record<string, unknown>;
  signature: string;
  status: "success" | "failed";
  errorMessage?: string;
  processedAt: Date;
  createdAt: Date;
}

const WebhookLogSchema: Schema = new Schema(
  {
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
    signature: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
      index: true,
    },
    errorMessage: {
      type: String,
    },
    processedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for querying by event type and status
WebhookLogSchema.index({ eventType: 1, status: 1 });
WebhookLogSchema.index({ createdAt: -1 });

const WebhookLog: Model<IWebhookLog> =
  mongoose.models.WebhookLog ||
  mongoose.model<IWebhookLog>("WebhookLog", WebhookLogSchema);

export default WebhookLog;

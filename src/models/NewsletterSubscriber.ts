import mongoose, { Document, Model, Schema } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  name?: string;
  phone?: string;
  status: "active" | "unsubscribed" | "bounced";
  subscribedAt: Date;
  unsubscribedAt?: Date;
  source: string;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "unsubscribed", "bounced"],
      default: "active",
      index: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      default: "website",
      enum: ["website", "manual", "import", "event", "campaign", "other"],
    },
    tags: {
      type: [String],
      default: [],
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

const NewsletterSubscriber: Model<INewsletterSubscriber> =
  mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>(
    "NewsletterSubscriber",
    newsletterSubscriberSchema
  );

export default NewsletterSubscriber;

import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICampaign extends Document {
  title: string;
  description: string;
  image: string;
  location: string;
  address: string;
  startDate: Date;
  endDate?: Date;
  type: "campaign" | "event";
  status: "ongoing" | "upcoming" | "completed";
  isActive: "yes" | "no";
  order: number;
  donationLink?: string;
  eventLink?: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
    },
    type: {
      type: String,
      enum: ["campaign", "event"],
      default: "campaign",
    },
    status: {
      type: String,
      enum: ["ongoing", "upcoming", "completed"],
      default: "ongoing",
    },
    isActive: {
      type: String,
      enum: ["yes", "no"],
      default: "yes",
    },
    order: {
      type: Number,
      default: 0,
    },
    donationLink: {
      type: String,
      trim: true,
    },
    eventLink: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Campaign: Model<ICampaign> =
  mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", campaignSchema);

export default Campaign;

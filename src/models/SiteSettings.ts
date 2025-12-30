import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISiteSettings extends Document {
  // Social Media Links
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;

  // Contact Information
  email: string;
  phone: string;
  address: string;

  // Bank Details
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;

  // UPI IDs
  upiId?: string;
  upiQrCode?: string;

  // Other Settings
  organizationName: string;
  tagline?: string;
  aboutUs?: string;

  updatedAt: Date;
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    // Social Media
    facebook: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    youtube: { type: String, trim: true },

    // Contact
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    // Bank Details
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true },
    accountHolderName: { type: String, trim: true },

    // UPI
    upiId: { type: String, trim: true },
    upiQrCode: { type: String, trim: true },

    // Other
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      default: "Samriddhi Seva Trust",
    },
    tagline: { type: String, trim: true },
    aboutUs: { type: String, trim: true },
  },
  {
    timestamps: true,
  }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);

export default SiteSettings;

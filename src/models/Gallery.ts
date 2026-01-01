import mongoose, { Document, Model, Schema } from "mongoose";

export interface IGallery extends Document {
  title: string;
  description?: string;
  files: Array<{ id: string; url: string; type: string }>; // Array of file objects with id, url, and type
  category: string;
  date: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGallery>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    files: {
      type: [
        {
          id: { type: String, required: true },
          url: { type: String, required: true },
          type: { type: String, required: true }, // 'image', 'video', 'pdf', etc.
        },
      ],
      required: [true, "At least one file is required"],
      validate: {
        validator(v: Array<{ id: string; url: string; type: string }>) {
          return v && v.length > 0;
        },
        message: "At least one file is required",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Food Distribution for Poor and Needy People",
        "Food Service in Hospitals",
        "Food Distribution in Orphanages",
        "Emergency Food Support During Natural Disasters and Critical Situations",
        "Blood Donation During Emergencies",
        "Distribution of Clothes and Essential Items to the Poor",
        "Helping Helpless and Homeless People with Food and Basic Needs",
        "Support to Elderly People Who Have No Family Support",
        "Assistance to Economically Weak Families",
        "Awareness Programs for Social Welfare",
        "Helping People During Accidents and Medical Emergencies",
        "Other Humanitarian and Social Service Activities",
      ],
      default: "other",
    },
    date: {
      type: Date,
      default: Date.now,
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

// Delete the model if it exists to avoid caching issues
if (mongoose.models.Gallery) {
  delete mongoose.models.Gallery;
}

const Gallery: Model<IGallery> = mongoose.model<IGallery>(
  "Gallery",
  gallerySchema
);

export default Gallery;

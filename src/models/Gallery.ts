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
        "food-rescue",
        "blood-donation",
        "child-welfare",
        "events",
        "other",
        "all",
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

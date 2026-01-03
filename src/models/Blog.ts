import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string; // Markdown content
  excerpt: string;
  coverImage: string;
  images: string[];
  author: {
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  isActive: "yes" | "no";
  order: number;
  views: number;
  likes: number;
  readTime: number; // in minutes
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      required: [true, "Excerpt is required"],
      trim: true,
      maxlength: 300,
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    author: {
      name: {
        type: String,
        required: [true, "Author name is required"],
      },
      avatar: {
        type: String,
        default: "",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
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
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    readTime: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ status: 1, isActive: 1 });
blogSchema.index({ createdAt: -1 });

const Blog: Model<IBlog> =
  mongoose.models.Blog || mongoose.model<IBlog>("Blog", blogSchema);

export default Blog;

import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBlogComment extends Document {
  blogId: mongoose.Types.ObjectId;
  blogSlug: string;
  userName: string;
  userEmail: string;
  comment: string;
  parentCommentId?: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "spam";
  likes: number;
  isEdited: boolean;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogCommentSchema = new Schema<IBlogComment>(
  {
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    blogSlug: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      maxlength: 1000,
    },
    parentCommentId: {
      type: Schema.Types.ObjectId,
      ref: "BlogComment",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "spam"],
      default: "pending",
      index: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound indexes
blogCommentSchema.index({ blogId: 1, status: 1, createdAt: -1 });
blogCommentSchema.index({ blogSlug: 1, status: 1, createdAt: 1 });

const BlogComment: Model<IBlogComment> =
  mongoose.models.BlogComment ||
  mongoose.model<IBlogComment>("BlogComment", blogCommentSchema);

export default BlogComment;

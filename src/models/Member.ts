import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMember extends Document {
  name: string;
  email: string;
  phone?: string;
  photo: string;
  joiningDate: Date;
  role?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      required: [true, "Photo is required"],
      default: "/uploads/default-avatar.png",
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      default: "Member",
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
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

const Member: Model<IMember> =
  mongoose.models.Member || mongoose.model<IMember>("Member", memberSchema);

export default Member;

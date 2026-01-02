import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMember extends Document {
  name: string;
  email: string;
  phone?: string;
  photo: string;
  bloodGroup: string;
  joiningDate: Date;
  role?: string;
  bio?: string;
  receivedIdCard: boolean;
  receivedTshirt: boolean;
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
    bloodGroup: {
      type: String,
      required: [true, "Blood group is required"],
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      trim: true,
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
    receivedIdCard: {
      type: Boolean,
      default: false,
    },
    receivedTshirt: {
      type: Boolean,
      default: false,
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

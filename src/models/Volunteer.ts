import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
    },
    address: {
      type: String,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
    },
    interests: {
      type: [String],
      default: [],
    },
    skills: {
      type: String,
    },
    availability: {
      type: String,
      enum: ["weekdays", "weekends", "both", "flexible"],
      default: "flexible",
    },
    experience: {
      type: String,
    },
    whyVolunteer: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "active", "inactive"],
      default: "pending",
    },
    joinedDate: {
      type: Date,
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

export default mongoose.models.Volunteer ||
  mongoose.model("Volunteer", VolunteerSchema);

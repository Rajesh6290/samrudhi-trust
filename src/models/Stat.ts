import mongoose from "mongoose";

const StatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    ref: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    suffix: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
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

export default mongoose.models.Stat || mongoose.model("Stat", StatSchema);

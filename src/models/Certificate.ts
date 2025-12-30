import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    issuedBy: {
      type: String,
      required: true,
    },
    issuedDate: {
      type: Date,
      required: true,
    },
    certificateNumber: {
      type: String,
      default: "",
    },
    imageUrl: {
      type: String,
      required: true,
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

export default mongoose.models.Certificate ||
  mongoose.model("Certificate", CertificateSchema);

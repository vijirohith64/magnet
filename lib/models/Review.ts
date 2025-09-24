import mongoose from "mongoose"

const ReviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["MALE", "FEMALE"],
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    complaint: {
      type: String,
      required: true,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
    ipAddress: {
      type: String,
      default: "unknown",
    },
    userAgent: {
      type: String,
      default: "unknown",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema)

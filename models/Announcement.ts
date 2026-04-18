import mongoose, { Document, Schema } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "staff" | "parent" | "both";
  createdBy: string;
  createdByName: string;
  expiresAt?: Date;
  isActive: boolean;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    targetAudience: {
      type: String,
      enum: ["staff", "parent", "both"],
      required: true,
    },
    createdBy: { type: String, required: true },
    createdByName: { type: String, required: true },
    expiresAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ targetAudience: 1, isActive: 1 });
AnnouncementSchema.index({ createdAt: -1 });

export default mongoose.models.Announcement ||
  mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);

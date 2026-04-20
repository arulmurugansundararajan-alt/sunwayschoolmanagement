import mongoose, { Document, Schema } from "mongoose";

export interface ISubject extends Document {
  name: string;
  code?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);

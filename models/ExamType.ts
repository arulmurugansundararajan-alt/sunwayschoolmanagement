import mongoose, { Document, Schema } from "mongoose";

export interface IExamType extends Document {
  name: string;
  maxMarks: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExamTypeSchema = new Schema<IExamType>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    maxMarks: { type: Number, default: 100, min: 1 },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ExamType || mongoose.model<IExamType>("ExamType", ExamTypeSchema);

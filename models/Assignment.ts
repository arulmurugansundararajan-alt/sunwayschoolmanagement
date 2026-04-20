import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  submittedAt?: Date;
  status: "pending" | "submitted" | "late" | "graded";
  grade?: string;
  remarks?: string;
}

export interface IAssignment extends Document {
  title: string;
  description: string;
  subject: string;
  className: string;
  section: string;
  dueDate: Date;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  academicYear: string;
  isActive: boolean;
  targetType: "class" | "student";
  targetStudentId?: mongoose.Types.ObjectId;
  targetStudentName?: string;
  submissions: ISubmission[];
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true, trim: true },
    submittedAt: { type: Date },
    status: { type: String, enum: ["pending", "submitted", "late", "graded"], default: "pending" },
    grade: { type: String, trim: true },
    remarks: { type: String, trim: true },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdByName: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    targetType: { type: String, enum: ["class", "student"], default: "class" },
    targetStudentId: { type: Schema.Types.ObjectId, ref: "Student" },
    targetStudentName: { type: String, trim: true },
    submissions: { type: [SubmissionSchema], default: [] },
  },
  { timestamps: true }
);

AssignmentSchema.index({ className: 1, section: 1, academicYear: 1 });
AssignmentSchema.index({ dueDate: 1 });
AssignmentSchema.index({ subject: 1 });
AssignmentSchema.index({ targetStudentId: 1 });

export default mongoose.models.Assignment ||
  mongoose.model<IAssignment>("Assignment", AssignmentSchema);

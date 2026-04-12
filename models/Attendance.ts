import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  classId: mongoose.Types.ObjectId;
  date: Date;
  status: "Present" | "Absent" | "Late" | "Holiday";
  markedBy: mongoose.Types.ObjectId;
  remarks?: string;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    studentName: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Absent", "Late", "Holiday"], required: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    remarks: { type: String },
  },
  { timestamps: true }
);

AttendanceSchema.index({ classId: 1, date: 1 });
AttendanceSchema.index({ studentId: 1, date: -1 });

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

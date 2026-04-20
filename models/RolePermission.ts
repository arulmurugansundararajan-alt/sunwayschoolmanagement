import mongoose, { Document, Schema } from "mongoose";

export type StaffRoleKey = "teacher" | "accountant";

export interface IRolePermission extends Document {
  role: StaffRoleKey;
  modules: string[];
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>(
  {
    role: { type: String, enum: ["teacher", "accountant"], required: true, unique: true },
    modules: [{ type: String, trim: true }],
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.RolePermission ||
  mongoose.model<IRolePermission>("RolePermission", RolePermissionSchema);

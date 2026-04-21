import mongoose, { Document, Schema } from "mongoose";

export type StaffRoleKey = string;

export interface IRolePermission extends Document {
  role: string;
  label: string;
  isSystem: boolean; // true = teacher/accountant (cannot be deleted)
  modules: string[];
  updatedBy?: string;
  updatedAt: Date;
  createdAt: Date;
}

const RolePermissionSchema = new Schema<IRolePermission>(
  {
    role: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    isSystem: { type: Boolean, default: false },
    modules: [{ type: String, trim: true }],
    updatedBy: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.models.RolePermission ||
  mongoose.model<IRolePermission>("RolePermission", RolePermissionSchema);

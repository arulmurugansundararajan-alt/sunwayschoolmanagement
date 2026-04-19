import mongoose, { Document, Schema } from "mongoose";

export const PREDEFINED_CATEGORIES = [
  "Utilities",
  "Maintenance",
  "Salary",
  "Events",
  "Stationery",
  "Transport",
  "IT & Technology",
  "Sports & Equipment",
  "Miscellaneous",
] as const;

export interface IExpenseCategory extends Document {
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
}

const ExpenseCategorySchema = new Schema<IExpenseCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: "tag" },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ExpenseCategory ||
  mongoose.model<IExpenseCategory>("ExpenseCategory", ExpenseCategorySchema);

import mongoose, { Document, Schema } from "mongoose";

export interface IExpense extends Document {
  title: string;
  amount: number;
  date: Date;
  category: string;
  paymentMode: "Cash" | "Bank Transfer" | "UPI" | "Cheque" | "Card";
  description?: string;
  vendor?: string;
  receiptNumber?: string;
  createdBy: string;
  createdByName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    category: { type: String, required: true, trim: true },
    paymentMode: {
      type: String,
      enum: ["Cash", "Bank Transfer", "UPI", "Cheque", "Card"],
      required: true,
    },
    description: { type: String, trim: true },
    vendor: { type: String, trim: true },
    receiptNumber: { type: String, trim: true },
    createdBy: { type: String, required: true },
    createdByName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ isActive: 1 });

export default mongoose.models.Expense ||
  mongoose.model<IExpense>("Expense", ExpenseSchema);

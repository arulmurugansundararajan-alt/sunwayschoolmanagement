import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ExpenseModel from "@/models/Expense";
import { getStaffRole } from "@/lib/staffAccess";

async function checkExpenseAccess() {
  const session = await getServerSession(authOptions);
  if (!session) return false;
  const role = (session.user as { role?: string }).role;
  if (role === "admin") return true;
  if (role === "staff") {
    const staffRole = await getStaffRole();
    return staffRole === "accountant";
  }
  return false;
}

// PUT /api/expenses/[id] — update expense (admin + accountant)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await checkExpenseAccess())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { title, amount, date, category, paymentMode, description, vendor, receiptNumber } = body;

    if (amount !== undefined && (isNaN(Number(amount)) || Number(amount) < 0)) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
    }

    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title.trim();
    if (amount !== undefined) update.amount = Number(amount);
    if (date !== undefined) update.date = new Date(date);
    if (category !== undefined) update.category = category.trim();
    if (paymentMode !== undefined) update.paymentMode = paymentMode;
    if (description !== undefined) update.description = description.trim() || undefined;
    if (vendor !== undefined) update.vendor = vendor.trim() || undefined;
    if (receiptNumber !== undefined) update.receiptNumber = receiptNumber.trim() || undefined;

    const expense = await ExpenseModel.findByIdAndUpdate(id, update, { new: true });
    if (!expense) {
      return NextResponse.json({ success: false, message: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { _id: expense._id.toString(), ...expense.toObject() },
      message: "Expense updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/expenses/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/expenses/[id] — admin only
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const expense = await ExpenseModel.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!expense) {
      return NextResponse.json({ success: false, message: "Expense not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/expenses/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

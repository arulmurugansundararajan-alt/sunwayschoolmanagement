import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ExpenseCategoryModel from "@/models/ExpenseCategory";

// PUT /api/expense-categories/[id] — update custom category (admin only)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const { name, color } = body;

    const category = await ExpenseCategoryModel.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    if (category.isDefault) {
      return NextResponse.json({ success: false, message: "Default categories cannot be modified" }, { status: 403 });
    }

    if (name?.trim()) {
      const existing = await ExpenseCategoryModel.findOne({
        _id: { $ne: id },
        name: { $regex: `^${name.trim()}$`, $options: "i" },
      });
      if (existing) {
        return NextResponse.json({ success: false, message: "Category name already exists" }, { status: 409 });
      }
      category.name = name.trim();
    }
    if (color) category.color = color;

    await category.save();

    return NextResponse.json({
      success: true,
      data: { _id: category._id.toString(), name: category.name, color: category.color, isDefault: category.isDefault },
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/expense-categories/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/expense-categories/[id] — soft delete custom category (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    const category = await ExpenseCategoryModel.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    if (category.isDefault) {
      return NextResponse.json({ success: false, message: "Default categories cannot be deleted" }, { status: 403 });
    }

    await ExpenseCategoryModel.findByIdAndUpdate(id, { isActive: false });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/expense-categories/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

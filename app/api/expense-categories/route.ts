import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ExpenseCategoryModel, { PREDEFINED_CATEGORIES } from "@/models/ExpenseCategory";
import { getStaffRole } from "@/lib/staffAccess";

/** Returns true if the session belongs to admin OR an accountant staff member */
async function canAccessCategories(): Promise<boolean> {
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

// GET /api/expense-categories — get all active categories (admin + accountant)
export async function GET(req: NextRequest) {
  try {
    if (!(await canAccessCategories())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Seed predefined categories if none exist
    const count = await ExpenseCategoryModel.countDocuments();
    if (count === 0) {
      const defaultColors = [
        "#ef4444", "#f97316", "#eab308", "#22c55e",
        "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
      ];
      await ExpenseCategoryModel.insertMany(
        PREDEFINED_CATEGORIES.map((name, i) => ({
          name,
          color: defaultColors[i] || "#6366f1",
          isDefault: true,
          isActive: true,
        }))
      );
    }

    const categories = await ExpenseCategoryModel.find({ isActive: true })
      .sort({ isDefault: -1, name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: categories.map((c) => ({
        _id: String(c._id),
        name: c.name,
        color: c.color,
        icon: c.icon,
        isDefault: c.isDefault,
      })),
    });
  } catch (error) {
    console.error("GET /api/expense-categories error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/expense-categories — create custom category (admin + accountant)
export async function POST(req: NextRequest) {
  try {
    if (!(await canAccessCategories())) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { name, color } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: "Category name is required" }, { status: 400 });
    }

    const existing = await ExpenseCategoryModel.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
    });
    if (existing) {
      return NextResponse.json({ success: false, message: "Category already exists" }, { status: 409 });
    }

    const category = await ExpenseCategoryModel.create({
      name: name.trim(),
      color: color || "#6366f1",
      isDefault: false,
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        data: { _id: category._id.toString(), name: category.name, color: category.color, isDefault: false },
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/expense-categories error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

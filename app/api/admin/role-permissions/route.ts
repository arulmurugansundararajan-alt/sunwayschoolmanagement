import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import RolePermissionModel from "@/models/RolePermission";

// All available modules in the staff portal
export const ALL_MODULES = [
  { key: "dashboard", label: "Dashboard", description: "Staff home dashboard" },
  { key: "classes", label: "Classes", description: "View and manage classes" },
  { key: "marks", label: "Marks Entry", description: "Enter and view student marks" },
  { key: "attendance", label: "Attendance", description: "Mark daily attendance" },
  { key: "assignments", label: "Assignments", description: "Create and manage assignments" },
  { key: "fees", label: "Fees", description: "Add and view fee records" },
  { key: "expenses", label: "Expenses", description: "Record and view expenses" },
  { key: "communication", label: "Communication", description: "Messages and announcements" },
  { key: "calendar", label: "Calendar", description: "View school calendar and events" },
] as const;

const DEFAULT_PERMISSIONS: Record<string, string[]> = {
  teacher: ["dashboard", "classes", "marks", "attendance", "assignments", "communication", "calendar"],
  accountant: ["dashboard", "fees", "expenses", "calendar"],
};

// GET /api/admin/role-permissions — list all role permissions (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Seed defaults if empty
    const count = await RolePermissionModel.countDocuments();
    if (count === 0) {
      await RolePermissionModel.insertMany(
        Object.entries(DEFAULT_PERMISSIONS).map(([role, modules]) => ({ role, modules }))
      );
    }

    const permissions = await RolePermissionModel.find().sort({ role: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: permissions,
      allModules: ALL_MODULES,
    });
  } catch (error) {
    console.error("GET /api/admin/role-permissions error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/role-permissions — update modules for a role (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { role, modules } = body;

    if (!role || !["teacher", "accountant"].includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 });
    }
    if (!Array.isArray(modules)) {
      return NextResponse.json({ success: false, message: "modules must be an array" }, { status: 400 });
    }

    // Validate modules
    const validKeys = ALL_MODULES.map((m) => m.key);
    const invalidModules = modules.filter((m: string) => !validKeys.includes(m as typeof validKeys[number]));
    if (invalidModules.length > 0) {
      return NextResponse.json({ success: false, message: `Invalid modules: ${invalidModules.join(", ")}` }, { status: 400 });
    }

    // Always ensure dashboard is included
    const finalModules = Array.from(new Set(["dashboard", ...modules]));

    const updatedBy = session.user.name || session.user.email || "admin";
    const permission = await RolePermissionModel.findOneAndUpdate(
      { role },
      { $set: { modules: finalModules, updatedBy } },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, data: permission });
  } catch (error) {
    console.error("PUT /api/admin/role-permissions error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

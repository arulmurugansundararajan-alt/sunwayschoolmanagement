import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import RolePermissionModel from "@/models/RolePermission";

export const ALL_MODULES = [
  { key: "dashboard",     label: "Dashboard",     description: "Staff home dashboard" },
  { key: "classes",       label: "Classes",        description: "View and manage classes" },
  { key: "marks",         label: "Marks Entry",    description: "Enter and view student marks" },
  { key: "attendance",    label: "Attendance",     description: "Mark daily attendance" },
  { key: "assignments",   label: "Assignments",    description: "Create and manage assignments" },
  { key: "fees",          label: "Fees",           description: "Add and view fee records" },
  { key: "expenses",      label: "Expenses",       description: "Record and view expenses" },
  { key: "communication", label: "Communication",  description: "Messages and announcements" },
  { key: "calendar",      label: "Calendar",       description: "View school calendar and events" },
] as const;

const DEFAULT_PERMISSIONS = [
  { role: "teacher",    label: "Teacher",    isSystem: true, modules: ["dashboard","classes","marks","attendance","assignments","communication","calendar"] },
  { role: "accountant", label: "Accountant", isSystem: true, modules: ["dashboard","fees","expenses","calendar"] },
];

// GET /api/admin/role-permissions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const count = await RolePermissionModel.countDocuments();
    if (count === 0) await RolePermissionModel.insertMany(DEFAULT_PERMISSIONS);

    const permissions = await RolePermissionModel.find().sort({ isSystem: -1, role: 1 }).lean();
    return NextResponse.json({ success: true, data: permissions, allModules: ALL_MODULES });
  } catch (error) {
    console.error("GET /api/admin/role-permissions error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/role-permissions - create a new custom role
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { role, label, modules } = body;

    if (!role || typeof role !== "string" || role.trim() === "")
      return NextResponse.json({ success: false, message: "Role key is required" }, { status: 400 });
    if (!label || typeof label !== "string" || label.trim() === "")
      return NextResponse.json({ success: false, message: "Role label is required" }, { status: 400 });
    if (!Array.isArray(modules))
      return NextResponse.json({ success: false, message: "modules must be an array" }, { status: 400 });

    const roleKey = role.trim().toLowerCase().replace(/\s+/g, "_");
    const validKeys = ALL_MODULES.map((m) => m.key);
    const filteredModules = modules.filter((m: string) => validKeys.includes(m as (typeof validKeys)[number]));
    const finalModules = Array.from(new Set(["dashboard", ...filteredModules]));

    const existing = await RolePermissionModel.findOne({ role: roleKey });
    if (existing)
      return NextResponse.json({ success: false, message: `Role "${roleKey}" already exists` }, { status: 409 });

    const created = await RolePermissionModel.create({
      role: roleKey, label: label.trim(), isSystem: false, modules: finalModules,
      updatedBy: session.user.name || session.user.email || "admin",
    });
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/role-permissions error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/admin/role-permissions - update modules for a role
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await request.json();
    const { role, modules } = body;

    if (!role || typeof role !== "string")
      return NextResponse.json({ success: false, message: "role is required" }, { status: 400 });
    if (!Array.isArray(modules))
      return NextResponse.json({ success: false, message: "modules must be an array" }, { status: 400 });

    const validKeys = ALL_MODULES.map((m) => m.key);
    const invalidModules = modules.filter((m: string) => !validKeys.includes(m as (typeof validKeys)[number]));
    if (invalidModules.length > 0)
      return NextResponse.json({ success: false, message: `Invalid modules: ${invalidModules.join(", ")}` }, { status: 400 });

    const finalModules = Array.from(new Set(["dashboard", ...modules]));
    const updatedBy = session.user.name || session.user.email || "admin";
    const permission = await RolePermissionModel.findOneAndUpdate(
      { role }, { $set: { modules: finalModules, updatedBy } }, { new: true, upsert: true }
    );
    return NextResponse.json({ success: true, data: permission });
  } catch (error) {
    console.error("PUT /api/admin/role-permissions error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/role-permissions?role=xxx - delete a custom role only
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin")
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    if (!role)
      return NextResponse.json({ success: false, message: "role query param is required" }, { status: 400 });

    const permission = await RolePermissionModel.findOne({ role });
    if (!permission)
      return NextResponse.json({ success: false, message: "Role not found" }, { status: 404 });
    if (permission.isSystem)
      return NextResponse.json({ success: false, message: "System roles cannot be deleted" }, { status: 403 });

    await RolePermissionModel.deleteOne({ role });
    return NextResponse.json({ success: true, message: "Role deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/role-permissions error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import StaffModel from "@/models/Staff";
import User from "@/models/User";
import crypto from "crypto";

// Generate school email from name
function generateSchoolEmail(name: string, suffix = 0): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return suffix === 0 ? `${base}@sunwayschooledu.in` : `${base}${suffix}@sunwayschooledu.in`;
}

// Default password for new accounts: first4letters@DDMM (date of joining)
function generateDefaultPassword(name: string, dateOfJoining: Date | string): string {
  const first4 = name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "").slice(0, 4).padEnd(4, "x");
  const doj = new Date(dateOfJoining);
  const dd = String(doj.getDate()).padStart(2, "0");
  const mm = String(doj.getMonth() + 1).padStart(2, "0");
  return `${first4}@${dd}${mm}`;
}

// Reset password: first4letters@<4 random digits>
function generateResetPassword(name: string): string {
  const first4 = name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "").slice(0, 4).padEnd(4, "x");
  const digits = crypto.randomInt(1000, 9999);
  return `${first4}@${digits}`;
}

// POST /api/staff/[id]/account — create login account for staff
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const staff = await StaffModel.findById(id);
    if (!staff) {
      return NextResponse.json({ success: false, message: "Staff member not found" }, { status: 404 });
    }

    // Check if already has an account
    if (staff.userId) {
      const existingUser = await User.findById(staff.userId);
      if (existingUser) {
        return NextResponse.json({ success: false, message: "This staff member already has a login account" }, { status: 409 });
      }
    }

    // Generate unique school email from name
    let schoolEmail = generateSchoolEmail(staff.name);
    let suffix = 1;
    while (await User.findOne({ email: schoolEmail })) {
      schoolEmail = generateSchoolEmail(staff.name, suffix++);
    }

    // Check if a staff user with this school email already exists and can be relinked
    const existingUserByEmail = await User.findOne({ email: schoolEmail });
    if (existingUserByEmail) {
      if (existingUserByEmail.role === "staff") {
        const linkedToOther = await StaffModel.findOne({ userId: existingUserByEmail._id, _id: { $ne: staff._id } });
        if (!linkedToOther) {
          const plainPassword = generateDefaultPassword(staff.name, staff.dateOfJoining);
          existingUserByEmail.password = plainPassword;
          existingUserByEmail.isActive = true;
          existingUserByEmail.name = staff.name;
          await existingUserByEmail.save();

          staff.userId = existingUserByEmail._id;
          await staff.save();

          return NextResponse.json({
            success: true,
            data: {
              email: schoolEmail,
              password: plainPassword,
              staffName: staff.name,
              staffId: staff.staffId,
            },
            message: "Existing account linked and password reset",
          }, { status: 201 });
        }
      }
      return NextResponse.json({ success: false, message: "An account with this email already exists" }, { status: 409 });
    }

    // Generate credentials
    const plainPassword = generateDefaultPassword(staff.name, staff.dateOfJoining);

    const user = await User.create({
      name: staff.name,
      email: schoolEmail,
      password: plainPassword, // pre-save hook in User model will hash it
      role: "staff",
      phone: staff.phone,
      isActive: true,
    });

    // Link user to staff
    staff.userId = user._id;
    await staff.save();

    return NextResponse.json({
      success: true,
      data: {
        email: schoolEmail,
        password: plainPassword, // show once to admin
        staffName: staff.name,
        staffId: staff.staffId,
      },
      message: "Login account created successfully",
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/staff/[id]/account error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/staff/[id]/account — reset password
export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const staff = await StaffModel.findById(id);
    if (!staff || !staff.userId) {
      return NextResponse.json({ success: false, message: "No login account found for this staff member" }, { status: 404 });
    }

    const user = await User.findById(staff.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "User account not found" }, { status: 404 });
    }

    const newPassword = generateResetPassword(staff.name);
    user.password = newPassword; // pre-save hook will hash
    await user.save();

    return NextResponse.json({
      success: true,
      data: {
        email: user.email,
        password: newPassword,
        staffName: staff.name,
        staffId: staff.staffId,
      },
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("PUT /api/staff/[id]/account error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/staff/[id]/account — revoke login access
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const staff = await StaffModel.findById(id);
    if (!staff || !staff.userId) {
      return NextResponse.json({ success: false, message: "No login account found for this staff member" }, { status: 404 });
    }

    // Deactivate the user account (soft delete)
    await User.findByIdAndUpdate(staff.userId, { $set: { isActive: false } });

    // Unlink from staff
    staff.userId = undefined;
    await staff.save();

    return NextResponse.json({ success: true, message: "Login access revoked" });
  } catch (error) {
    console.error("DELETE /api/staff/[id]/account error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

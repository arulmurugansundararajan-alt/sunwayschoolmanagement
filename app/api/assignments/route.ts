import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import AssignmentModel from "@/models/Assignment";
import StaffModel from "@/models/Staff";
import StudentModel from "@/models/Student";

// GET /api/assignments
// Staff  → assignments they created
// Parent → child's class (pass ?childId=)
// Admin  → all (optionally filtered by ?className=&section=&subject=)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = (session.user as { role?: string }).role;
    const userId = (session.user as { id?: string }).id;

    const filter: Record<string, unknown> = { isActive: true };

    if (role === "staff") {
      // Return only assignments created by this staff member
      filter.createdBy = userId;
    } else if (role === "parent") {
      const childId = searchParams.get("childId");
      if (!childId) {
        return NextResponse.json({ success: false, message: "childId required" }, { status: 400 });
      }
      const child = await StudentModel.findById(childId);
      if (!child) {
        return NextResponse.json({ success: false, message: "Child not found" }, { status: 404 });
      }
      // Return class-wide assignments + student-specific assignments for this child
      filter.$or = [
        { className: child.className, section: child.section, targetType: "class" },
        { targetStudentId: child._id },
      ];
      delete filter.isActive;
      filter.isActive = true;
    } else if (role === "admin") {
      const className = searchParams.get("className");
      const section = searchParams.get("section");
      const subject = searchParams.get("subject");
      if (className) filter.className = className;
      if (section) filter.section = section;
      if (subject) filter.subject = subject;
    } else {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const assignments = await AssignmentModel.find(filter)
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: assignments.map((a) => ({
        _id: String(a._id),
        title: a.title,
        description: a.description,
        subject: a.subject,
        className: a.className,
        section: a.section,
        dueDate: a.dueDate instanceof Date ? a.dueDate.toISOString().split("T")[0] : String(a.dueDate).split("T")[0],
        createdByName: a.createdByName,
        academicYear: a.academicYear,
        targetType: (a as { targetType?: string }).targetType || "class",
        targetStudentId: (a as { targetStudentId?: unknown }).targetStudentId ? String((a as { targetStudentId?: unknown }).targetStudentId) : undefined,
        targetStudentName: (a as { targetStudentName?: string }).targetStudentName,
        submissionsCount: Array.isArray((a as { submissions?: unknown[] }).submissions) ? (a as { submissions?: unknown[] }).submissions!.length : 0,
        createdAt: (a.createdAt as Date).toISOString(),
      })),
    });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/assignments — staff only
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string })?.role;
    if (!session || role !== "staff") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = (session.user as { id?: string }).id;
    const staff = await StaffModel.findOne({ userId, isActive: true }).lean();
    if (!staff) {
      return NextResponse.json({ success: false, message: "Staff profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, subject, className, section, dueDate, academicYear,
      targetType, targetStudentId, targetStudentName } = body;

    if (!title || !description || !subject || !className || !section || !dueDate || !academicYear) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    const assignmentData: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      subject: subject.trim(),
      className,
      section,
      dueDate: new Date(dueDate),
      createdBy: userId,
      createdByName: staff.name,
      academicYear,
      isActive: true,
      targetType: targetType === "student" ? "student" : "class",
    };

    if (targetType === "student" && targetStudentId) {
      assignmentData.targetStudentId = targetStudentId;
      if (targetStudentName) assignmentData.targetStudentName = targetStudentName;
    }

    const assignment = await AssignmentModel.create(assignmentData);

    return NextResponse.json({ success: true, data: assignment }, { status: 201 });
  } catch (error) {
    console.error("POST /api/assignments error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

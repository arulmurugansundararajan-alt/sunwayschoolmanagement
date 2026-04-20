import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import SubjectModel from "@/models/Subject";
import MarksModel from "@/models/Marks";

// DELETE /api/subjects/[id] — soft-delete a subject (admin only; blocked if marks exist)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Only admins can delete subjects" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const subject = await SubjectModel.findById(id);
    if (!subject) {
      return NextResponse.json({ success: false, message: "Subject not found" }, { status: 404 });
    }

    // Block deletion if any marks reference this subject
    const marksCount = await MarksModel.countDocuments({ subject: subject.name });
    if (marksCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete "${subject.name}" — ${marksCount} mark record(s) exist for this subject. Archive it instead.`,
      }, { status: 409 });
    }

    // Soft delete
    subject.isActive = false;
    await subject.save();

    return NextResponse.json({ success: true, message: `Subject "${subject.name}" removed` });
  } catch (error) {
    console.error("DELETE /api/subjects/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/subjects/[id] — toggle active status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const subject = await SubjectModel.findByIdAndUpdate(
      id,
      { $set: { name: body.name?.trim() } },
      { new: true }
    );
    if (!subject) {
      return NextResponse.json({ success: false, message: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: subject });
  } catch (error) {
    console.error("PATCH /api/subjects/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

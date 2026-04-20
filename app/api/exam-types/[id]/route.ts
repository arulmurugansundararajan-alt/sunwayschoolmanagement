import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ExamTypeModel from "@/models/ExamType";
import MarksModel from "@/models/Marks";

// DELETE /api/exam-types/[id] — soft-delete an exam type (admin only; blocked if marks exist)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Only admins can delete exam types" }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const examType = await ExamTypeModel.findById(id);
    if (!examType) {
      return NextResponse.json({ success: false, message: "Exam type not found" }, { status: 404 });
    }

    // Block deletion if any marks reference this exam type
    const marksCount = await MarksModel.countDocuments({ examType: examType.name });
    if (marksCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Cannot delete "${examType.name}" — ${marksCount} mark record(s) exist for this exam. Archive it instead.`,
      }, { status: 409 });
    }

    // Soft delete
    examType.isActive = false;
    await examType.save();

    return NextResponse.json({ success: true, message: `Exam type "${examType.name}" removed` });
  } catch (error) {
    console.error("DELETE /api/exam-types/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ExamTypeModel from "@/models/ExamType";

const DEFAULT_EXAM_TYPES = [
  { name: "Unit Test 1", maxMarks: 25 },
  { name: "Unit Test 2", maxMarks: 25 },
  { name: "Mid Term", maxMarks: 50 },
  { name: "Final", maxMarks: 100 },
];

// GET /api/exam-types — list all active exam types (admin + staff)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "staff"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Seed defaults if collection is empty
    const count = await ExamTypeModel.countDocuments();
    if (count === 0) {
      await ExamTypeModel.insertMany(
        DEFAULT_EXAM_TYPES.map((et) => ({ ...et, isDefault: true, isActive: true }))
      );
    }

    const examTypes = await ExamTypeModel.find({ isActive: true })
      .sort({ isDefault: -1, name: 1 })
      .lean();

    return NextResponse.json({ success: true, data: examTypes });
  } catch (error) {
    console.error("GET /api/exam-types error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/exam-types — add a new exam type (admin + staff)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "staff"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const name = (body.name || "").trim();
    const maxMarks = Number(body.maxMarks) || 100;

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, message: "Exam type name must be at least 2 characters" }, { status: 400 });
    }
    if (maxMarks < 1 || maxMarks > 1000) {
      return NextResponse.json({ success: false, message: "Max marks must be between 1 and 1000" }, { status: 400 });
    }

    // Duplicate check (case-insensitive)
    const existing = await ExamTypeModel.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.maxMarks = maxMarks;
        await existing.save();
        return NextResponse.json({ success: true, data: existing, message: "Exam type re-activated" });
      }
      return NextResponse.json({ success: false, message: "Exam type already exists" }, { status: 400 });
    }

    const examType = await ExamTypeModel.create({ name, maxMarks, isDefault: false, isActive: true });
    return NextResponse.json({ success: true, data: examType }, { status: 201 });
  } catch (error) {
    console.error("POST /api/exam-types error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import SubjectModel from "@/models/Subject";

const DEFAULT_SUBJECTS = [
  "Mathematics", "English", "Tamil", "Science", "Social Science",
  "Physics", "Chemistry", "Biology", "History", "Geography",
  "Computer Science", "Physical Education", "Art", "Music",
];

// GET /api/subjects — list all active subjects (admin + staff)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "staff"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Seed defaults if collection is empty
    const count = await SubjectModel.countDocuments();
    if (count === 0) {
      await SubjectModel.insertMany(
        DEFAULT_SUBJECTS.map((name) => ({ name, isDefault: true, isActive: true }))
      );
    }

    const subjects = await SubjectModel.find({ isActive: true })
      .sort({ isDefault: -1, name: 1 })
      .lean();

    return NextResponse.json({ success: true, data: subjects });
  } catch (error) {
    console.error("GET /api/subjects error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/subjects — add a new subject (admin + staff)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !["admin", "staff"].includes(session.user.role)) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const name = (body.name || "").trim();
    const code = (body.code || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, message: "Subject name must be at least 2 characters" }, { status: 400 });
    }

    // Duplicate check (case-insensitive)
    const existing = await SubjectModel.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
    if (existing) {
      if (!existing.isActive) {
        // Re-activate instead of duplicating
        existing.isActive = true;
        await existing.save();
        return NextResponse.json({ success: true, data: existing, message: "Subject re-activated" });
      }
      return NextResponse.json({ success: false, message: "Subject already exists" }, { status: 400 });
    }

    const subject = await SubjectModel.create({ name, code: code || undefined, isDefault: false, isActive: true });
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    console.error("POST /api/subjects error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/subjects — use the [id] route for individual deletions

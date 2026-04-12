import { NextRequest, NextResponse } from "next/server";
import { mockStudents } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let students = [...mockStudents];

  if (classId) {
    students = students.filter((s) => s.classId === classId);
  }

  if (search) {
    const q = search.toLowerCase();
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
    );
  }

  const total = students.length;
  const start = (page - 1) * limit;
  const paginated = students.slice(start, start + limit);

  return NextResponse.json({
    success: true,
    data: paginated,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // In production, save to MongoDB
    // For demo, return the data with a generated ID
    const newStudent = {
      ...body,
      _id: `stu${Date.now()}`,
      studentId: `PA2024${String(mockStudents.length + 1).padStart(4, "0")}`,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ success: true, data: newStudent }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to create student" }, { status: 500 });
  }
}

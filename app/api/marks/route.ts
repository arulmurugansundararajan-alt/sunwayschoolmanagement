import { NextRequest, NextResponse } from "next/server";
import { mockMarks } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");
  const examType = searchParams.get("examType");
  const subject = searchParams.get("subject");

  let marks = [...mockMarks];

  if (classId) marks = marks.filter((m) => m.classId === classId);
  if (studentId) marks = marks.filter((m) => m.studentId === studentId);
  if (examType) marks = marks.filter((m) => m.examType === examType);
  if (subject) marks = marks.filter((m) => m.subject === subject);

  return NextResponse.json({ success: true, data: marks, total: marks.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const records = body.records || [body];
    const saved = records.map((r: Record<string, unknown>, i: number) => {
      const marksObtained = r.marksObtained as number;
      const maxMarks = (r.maxMarks as number) || 100;
      const percentage = Math.round((marksObtained / maxMarks) * 100);
      let grade = "F";
      if (percentage >= 91) grade = "A+";
      else if (percentage >= 81) grade = "A";
      else if (percentage >= 71) grade = "B+";
      else if (percentage >= 61) grade = "B";
      else if (percentage >= 51) grade = "C+";
      else if (percentage >= 41) grade = "C";
      else if (percentage >= 35) grade = "D";
      return {
        ...r,
        _id: `mrk_${Date.now()}_${i}`,
        percentage,
        grade,
        createdAt: new Date().toISOString(),
      };
    });
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to save marks" }, { status: 500 });
  }
}

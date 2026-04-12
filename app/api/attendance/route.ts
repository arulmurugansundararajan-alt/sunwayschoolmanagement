import { NextRequest, NextResponse } from "next/server";
import { mockAttendance } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const date = searchParams.get("date");
  const studentId = searchParams.get("studentId");
  const month = searchParams.get("month");

  let records = [...mockAttendance];

  if (classId) records = records.filter((r) => r.classId === classId);
  if (date) records = records.filter((r) => r.date === date);
  if (studentId) records = records.filter((r) => r.studentId === studentId);
  if (month) records = records.filter((r) => r.date.startsWith(month));

  return NextResponse.json({ success: true, data: records, total: records.length });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const records = body.records || [body];
    const saved = records.map((r: Record<string, string>, i: number) => ({
      ...r,
      _id: `att_${Date.now()}_${i}`,
      createdAt: new Date().toISOString(),
    }));
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to save attendance" }, { status: 500 });
  }
}

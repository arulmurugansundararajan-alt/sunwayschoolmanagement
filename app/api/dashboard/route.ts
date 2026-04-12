import { NextRequest, NextResponse } from "next/server";
import { mockDashboardStats, enrollmentTrendData, attendanceMonthlyData, feeCollectionData, gradeDistributionData } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "charts") {
    return NextResponse.json({
      success: true,
      data: {
        enrollment: enrollmentTrendData,
        attendance: attendanceMonthlyData,
        fees: feeCollectionData,
        grades: gradeDistributionData,
      },
    });
  }

  return NextResponse.json({ success: true, data: mockDashboardStats });
}

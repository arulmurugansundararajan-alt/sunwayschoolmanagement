import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import StudentModel from "@/models/Student";
import StaffModel from "@/models/Staff";
import FeeModel from "@/models/Fee";
import AttendanceModel from "@/models/Attendance";
import MarksModel from "@/models/Marks";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd   = new Date(todayStart.getTime() + 86_400_000);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const [
    totalStudents,
    totalStaff,
    feeMonthAgg,
    feePendingAgg,
    todayPresentCount,
    todayTotalCount,
    recentStudents,
    classStrength,
    feeTypeBreakdown,
    enrollmentTrend,
    feeCollectionTrend,
    attendanceTrend,
    gradeDistribution,
  ] = await Promise.all([
    StudentModel.countDocuments({ isActive: true }),
    StaffModel.countDocuments({ isActive: true }),
    // Fee collected this month (by paidDate)
    FeeModel.aggregate([
      { $match: { paidDate: { $gte: startOfMonth, $lt: todayEnd }, status: { $in: ["Paid", "Partial"] } } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),
    // Pending fees (outstanding balance)
    FeeModel.aggregate([
      { $match: { status: { $in: ["Pending", "Partial", "Overdue"] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ["$amount", "$paidAmount"] } } } },
    ]),
    // Today present
    AttendanceModel.countDocuments({ date: { $gte: todayStart, $lt: todayEnd }, status: "Present" }),
    // Today total attendance records
    AttendanceModel.countDocuments({ date: { $gte: todayStart, $lt: todayEnd } }),
    // Recent 5 students by admission
    StudentModel.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name studentId className section")
      .lean(),
    // Class-wise strength
    StudentModel.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$className", students: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    // Fee type breakdown (top 6)
    FeeModel.aggregate([
      { $group: { _id: "$feeType", value: { $sum: "$amount" } } },
      { $sort: { value: -1 } },
      { $limit: 6 },
    ]),
    // Enrollment trend (last 12 months by admissionDate)
    StudentModel.aggregate([
      { $match: { admissionDate: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { year: { $year: "$admissionDate" }, month: { $month: "$admissionDate" } }, students: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    // Fee collection trend (last 6 months)
    FeeModel.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        collected: { $sum: { $cond: [{ $in: ["$status", ["Paid", "Partial"]] }, "$paidAmount", 0] } },
        pending:   { $sum: { $cond: [{ $in: ["$status", ["Pending", "Partial", "Overdue"]] }, { $subtract: ["$amount", "$paidAmount"] }, 0] } },
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    // Attendance trend (last 6 months)
    AttendanceModel.aggregate([
      { $match: { date: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" }, status: "$status" },
        count: { $sum: 1 },
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    // Grade distribution
    MarksModel.aggregate([
      { $group: { _id: "$grade", value: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // ── Process stats ──────────────────────────────────────────────────────────
  const feeCollectionMonth = feeMonthAgg[0]?.total ?? 0;
  const pendingFees        = feePendingAgg[0]?.total ?? 0;
  const attendanceToday    = todayTotalCount > 0
    ? Math.round((todayPresentCount / todayTotalCount) * 100)
    : 0;

  // ── Build chart arrays ─────────────────────────────────────────────────────
  const enrollmentChart = enrollmentTrend.map((e: { _id: { year: number; month: number }; students: number }) => ({
    name: `${MONTHS[e._id.month - 1]} '${String(e._id.year).slice(2)}`,
    students: e.students,
  }));

  const feeCollectionChart = feeCollectionTrend.map((f: { _id: { year: number; month: number }; collected: number; pending: number }) => ({
    name: `${MONTHS[f._id.month - 1]} '${String(f._id.year).slice(2)}`,
    collected: f.collected,
    pending: f.pending,
  }));

  // Aggregate attendance by month
  const attMap: Record<string, { present: number; total: number; year: number; month: number }> = {};
  for (const a of attendanceTrend as { _id: { year: number; month: number; status: string }; count: number }[]) {
    const k = `${a._id.year}-${a._id.month}`;
    if (!attMap[k]) attMap[k] = { present: 0, total: 0, year: a._id.year, month: a._id.month };
    attMap[k].total += a.count;
    if (a._id.status === "Present") attMap[k].present += a.count;
  }
  const attendanceChart = Object.values(attMap)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .map(({ present, total, year, month }) => ({
      name: `${MONTHS[month - 1]} '${String(year).slice(2)}`,
      present: total > 0 ? Math.round((present / total) * 100) : 0,
      absent:  total > 0 ? Math.round(((total - present) / total) * 100) : 0,
    }));

  const classStrengthChart = (classStrength as { _id: string; students: number }[]).map(c => ({
    name: c._id,
    students: c.students,
  }));

  const feeTypeChart = (feeTypeBreakdown as { _id: string; value: number }[]).map(f => ({
    name: f._id || "Other",
    value: f.value,
  }));

  const gradeOrder = ["O", "A+", "A", "B+", "B", "C", "F"];
  const gradeChart = (gradeDistribution as { _id: string; value: number }[])
    .filter(g => g._id)
    .sort((a, b) => {
      const ai = gradeOrder.indexOf(a._id);
      const bi = gradeOrder.indexOf(b._id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    })
    .map(g => ({ name: g._id, value: g.value }));

  return NextResponse.json({
    success: true,
    stats: {
      totalStudents,
      totalStaff,
      totalClasses: classStrengthChart.length,
      feeCollectionMonth,
      pendingFees,
      attendanceToday,
    },
    recentStudents: (recentStudents as unknown as { _id: unknown; name: string; studentId: string; className: string; section: string }[]).map(s => ({
      _id: String(s._id),
      name: s.name,
      studentId: s.studentId,
      className: s.className,
      section: s.section,
    })),
    charts: {
      enrollment:      enrollmentChart.length      ? enrollmentChart      : null,
      feeCollection:   feeCollectionChart.length   ? feeCollectionChart   : null,
      attendance:      attendanceChart.length       ? attendanceChart      : null,
      classStrength:   classStrengthChart.length    ? classStrengthChart   : null,
      feeTypeBreakdown: feeTypeChart.length         ? feeTypeChart         : null,
      gradeDistribution: gradeChart.length          ? gradeChart           : null,
    },
  });
}

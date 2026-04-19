import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import StaffModel from "@/models/Staff";
import StudentModel from "@/models/Student";
import AttendanceModel from "@/models/Attendance";
import MarksModel from "@/models/Marks";
import { getSectionFromGrade } from "@/lib/constants";

// GET /api/staff/me — returns the logged-in staff member's profile + dashboard data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "staff") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = (session.user as { id?: string }).id;

    // Find staff linked to this user
    const staff = await StaffModel.findOne({ userId, isActive: true }).lean();
    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Staff profile not found" },
        { status: 404 }
      );
    }

    // Get students in the staff's assigned classes
    // classTeacherClasses + subjectTeacherClasses are the new fields; fall back to legacy .classes
    const classTeacherClasses: string[] = (staff as { classTeacherClasses?: string[] }).classTeacherClasses ?? [];
    const subjectTeacherClasses: string[] = (staff as { subjectTeacherClasses?: string[] }).subjectTeacherClasses ?? [];
    // All unique classes this staff is associated with
    const allClasses: string[] = Array.from(new Set([
      ...classTeacherClasses,
      ...subjectTeacherClasses,
      ...(staff.classes || []),
    ]));

    const classFilters = allClasses.map((cls: string) => {
      const section = getSectionFromGrade(cls);
      return { className: cls, section };
    });

    const students = classFilters.length > 0
      ? await StudentModel.find({ $or: classFilters, isActive: true })
          .sort({ className: 1, section: 1, rollNumber: 1 })
          .lean()
      : [];

    // Get today's attendance for staff's classes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = classFilters.length > 0
      ? await AttendanceModel.find({
          $or: classFilters.map((f) => ({
            className: f.className,
            ...(f.section ? { section: f.section } : {}),
          })),
          date: { $gte: today, $lt: tomorrow },
        }).lean()
      : [];

    // Count pending marks (classes × subjects that don't have marks for current academic year)
    const currentYear = `${today.getFullYear()}-${today.getFullYear() + 1}`;
    const marksEnteredCount = await MarksModel.distinct("subject", {
      $or: classFilters.map((f) => ({
        className: f.className,
        ...(f.section ? { section: f.section } : {}),
      })),
      academicYear: currentYear,
    });

    const totalStudents = students.length;
    const presentToday = todayAttendance.filter((a) => a.status === "Present").length;
    const absentToday = todayAttendance.filter((a) => a.status === "Absent").length;
    const lateToday = todayAttendance.filter((a) => a.status === "Late").length;
    const attendanceMarked = todayAttendance.length > 0;
    const attendancePercent = totalStudents > 0 && attendanceMarked
      ? Math.round(((presentToday + lateToday) / totalStudents) * 100)
      : 0;

    // Build class summary — each class tagged with the staff's role in it
    const classSummary = allClasses.map((cls: string) => {
      const section = getSectionFromGrade(cls);
      const classStudents = students.filter(
        (s) => s.className === cls && s.section === section
      );
      const isClassTeacher = classTeacherClasses.includes(cls) ||
        // legacy fallback: if no new fields set, use old classTeacher field
        (classTeacherClasses.length === 0 && subjectTeacherClasses.length === 0 &&
          (staff.classTeacher === cls || (staff.classes.length === 1)));
      const isSubjectTeacher = subjectTeacherClasses.includes(cls) ||
        // legacy fallback
        (classTeacherClasses.length === 0 && subjectTeacherClasses.length === 0 &&
          (staff as { teacherType?: string }).teacherType === "subject_teacher");
      return {
        name: cls,
        className: cls,
        section,
        studentCount: classStudents.length,
        subjects: staff.subjects,
        isClassTeacher: !!isClassTeacher,
        isSubjectTeacher: !!isSubjectTeacher,
        roleLabel: isClassTeacher && isSubjectTeacher
          ? "Class Teacher + Subject Teacher"
          : isClassTeacher
          ? "Class Teacher"
          : "Subject Teacher",
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          _id: staff._id,
          staffId: staff.staffId,
          name: staff.name,
          email: staff.email,
          phone: staff.phone,
          designation: staff.designation,
          department: staff.department,
          subjects: staff.subjects,
          classes: staff.classes,
          classTeacher: staff.classTeacher || "",
          classTeacherClasses,
          subjectTeacherClasses,
          qualifications: staff.qualifications,
          experience: staff.experience,
          gender: staff.gender,
          teacherType: (staff as { teacherType?: string }).teacherType || "class_teacher",
        },
        stats: {
          totalStudents,
          presentToday,
          absentToday,
          lateToday,
          attendancePercent,
          attendanceMarked,
          marksPendingSubjects: Math.max(0, staff.subjects.length - marksEnteredCount.length),
        },
        classSummary,
        students: students.map((s) => ({
          _id: String(s._id),
          studentId: s.studentId,
          name: s.name,
          className: s.className,
          section: s.section,
          rollNumber: s.rollNumber,
          gender: s.gender,
          bloodGroup: s.bloodGroup,
          parentName: s.parentName,
          parentPhone: s.parentPhone,
          phone: s.phone,
        })),
        todayAttendance: todayAttendance.map((a) => ({
          _id: String(a._id),
          studentId: a.studentId.toString(),
          studentName: a.studentName,
          status: a.status,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/staff/me error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

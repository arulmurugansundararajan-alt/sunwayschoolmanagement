"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import StatCard from "@/components/shared/StatCard";
import BarChartComponent from "@/components/charts/BarChartComponent";
import RadarChartComponent from "@/components/charts/RadarChartComponent";
import { mockStudents, mockAttendanceRecords, mockMarksRecords, mockFeeRecords, mockNotifications, studentPerformanceRadarData, subjectPerformanceData } from "@/lib/mock-data";
import { formatDate, formatCurrency, getGradeColor, calculateGrade } from "@/lib/utils";
import { User, CheckCircle, Award, CreditCard, Bell, ChevronRight, BookOpen } from "lucide-react";

const myChild = mockStudents[0];
const myFees = mockFeeRecords.filter(f => f.studentId === myChild._id);
const pendingFees = myFees.filter(f => f.status === "Pending" || f.status === "Overdue");
const recentMarks = mockMarksRecords.filter(m => m.studentId === myChild._id).slice(0, 5);
const parentNotifications = mockNotifications.filter(n => n.targetRole === "parent" || n.targetRole === "all").slice(0, 4);

const lastMonthAttendance = mockAttendanceRecords.filter(a => a.studentId === myChild._id);
const attendancePercent = lastMonthAttendance.length > 0
  ? Math.round((lastMonthAttendance.filter(a => a.status === "Present").length / lastMonthAttendance.length) * 100)
  : 87;

const subjectBarData = subjectPerformanceData.slice(0, 5).map(s => ({
  subject: s.subject.substring(0, 4),
  marks: s.average,
}));

export default function ParentDashboard() {
  return (
    <div className="space-y-5">
      {/* Child Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative z-10 flex items-center gap-5">
          <Avatar name={myChild.name} size="xl" colorIndex={2} />
          <div>
            <p className="text-white/70 text-xs font-medium mb-0.5">My Child</p>
            <h2 className="text-2xl font-bold">{myChild.name}</h2>
            <p className="text-white/70 text-sm">Class {myChild.class}{myChild.section} • Roll #{myChild.rollNumber} • {myChild.academicYear}</p>
            <div className="flex gap-3 mt-2">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{myChild.bloodGroup}</span>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{myChild.gender}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Attendance"
          value={`${attendancePercent}%`}
          subtitle="This month"
          icon={CheckCircle}
          iconBg="bg-emerald-100"
          trend={{ value: 2, label: "vs last month" }}
        />
        <StatCard
          title="Latest Grade"
          value={recentMarks.length > 0 ? recentMarks[0].grade : "A"}
          subtitle={recentMarks.length > 0 ? recentMarks[0].subject : "Mathematics"}
          icon={Award}
          iconBg="bg-amber-100"
        />
        <StatCard
          title="Fees Due"
          value={pendingFees.length > 0 ? formatCurrency(pendingFees.reduce((a, f) => a + f.amount, 0)) : "NIL"}
          subtitle={pendingFees.length > 0 ? `${pendingFees.length} pending` : "All paid"}
          icon={CreditCard}
          iconBg={pendingFees.length > 0 ? "bg-red-100" : "bg-green-100"}
        />
        <StatCard
          title="Notifications"
          value={parentNotifications.filter(n => !n.isRead).length}
          subtitle="Unread"
          icon={Bell}
          iconBg="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Performance Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Subject Performance</CardTitle>
              <a href="/parent/performance" className="text-xs text-purple-600 font-medium hover:text-purple-700">View All →</a>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={subjectBarData}
              bars={[{ key: "marks", color: "#9333EA", name: "Score" }]}
              xKey="subject"
              height={180}
              showLegend={false}
            />
          </CardContent>
        </Card>

        {/* Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Skill Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <RadarChartComponent
              data={studentPerformanceRadarData}
              lines={[{ key: "student", color: "#9333EA", name: myChild.name }]}
              height={180}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Marks */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Marks</CardTitle>
              <a href="/parent/performance" className="text-xs text-purple-600 font-medium hover:text-purple-700">Full Report →</a>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentMarks.map(m => (
                <div key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{m.subject}</p>
                    <p className="text-xs text-gray-500">{m.examType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{m.marksObtained}/{m.maxMarks}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${getGradeColor(m.grade)}`}>{m.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {parentNotifications.map(notif => (
              <div key={notif._id} className={`flex items-start gap-3 p-3 rounded-xl ${!notif.isRead ? "bg-purple-50" : "bg-gray-50"}`}>
                <Bell className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 mt-1" />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Fee Summary */}
      {pendingFees.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-bold text-amber-800">Outstanding Fees</p>
              <p className="text-sm text-amber-700 mt-0.5">Please pay to avoid late charges</p>
              <div className="flex gap-3 mt-3">
                {pendingFees.slice(0, 3).map(f => (
                  <div key={f._id} className="bg-white/70 rounded-xl px-3 py-2">
                    <p className="text-xs text-amber-700 font-medium">{f.feeType}</p>
                    <p className="text-sm font-bold text-amber-900">{formatCurrency(f.amount)}</p>
                    <Badge variant={f.status === "Overdue" ? "destructive" : "warning"} className="text-xs mt-0.5">{f.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <a href="/parent/fees" className="flex items-center gap-1 text-sm text-amber-700 font-bold hover:text-amber-800">
              Pay Now <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

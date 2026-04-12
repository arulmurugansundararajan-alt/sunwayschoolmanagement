"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/shared/StatCard";
import BarChartComponent from "@/components/charts/BarChartComponent";
import LineChartComponent from "@/components/charts/LineChartComponent";
import { Avatar } from "@/components/ui/avatar";
import { mockStudents, mockClasses, attendanceMonthlyData, subjectPerformanceData, mockNotifications } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Users, ClipboardList, Award, Bell, BookOpen, CheckCircle } from "lucide-react";

export default function StaffDashboard() {
  const myClasses = mockClasses.slice(0, 3);
  const myStudents = mockStudents.filter(s => s.classId === "cls1").slice(0, 8);
  const todayDate = formatDate(new Date().toISOString());

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Good morning, Mrs. Lakshmi! 🌸</h2>
          <p className="text-white/70 text-sm">{todayDate} • Class Teacher: 6A</p>
          <div className="flex gap-6 mt-3">
            <div><p className="text-2xl font-bold">42</p><p className="text-white/60 text-xs">Students</p></div>
            <div className="w-px h-10 bg-white/20" />
            <div><p className="text-2xl font-bold">87%</p><p className="text-white/60 text-xs">Today's Att.</p></div>
            <div className="w-px h-10 bg-white/20" />
            <div><p className="text-2xl font-bold">3</p><p className="text-white/60 text-xs">Pending Tasks</p></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="My Students" value="42" subtitle="Class 6A" icon={Users} iconBg="bg-blue-100" trend={{ value: 3, label: "vs last year" }} />
        <StatCard title="Attendance Today" value="87%" subtitle="37/42 present" icon={ClipboardList} iconBg="bg-emerald-100" trend={{ value: 2, label: "vs yesterday" }} />
        <StatCard title="Marks Pending" value="3" subtitle="Subjects" icon={Award} iconBg="bg-amber-100" trend={{ value: -1, label: "completed today" }} />
        <StatCard title="Notifications" value={mockNotifications.filter(n => !n.isRead && (n.targetRole === "staff" || n.targetRole === "all")).length} subtitle="Unread" icon={Bell} iconBg="bg-purple-100" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Today's Attendance Quick View */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Today's Attendance — Class 6A</CardTitle>
              <a href="/staff/attendance" className="text-xs text-emerald-600 font-medium hover:text-emerald-700">
                Mark All →
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {myStudents.map((student, i) => {
                const isPresent = i % 7 !== 0;
                return (
                  <div key={student._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                    <Avatar name={student.name} size="sm" colorIndex={i % 8} />
                    <span className="flex-1 text-sm font-medium text-gray-800">{student.name}</span>
                    <span className="text-xs text-gray-500">#{student.rollNumber}</span>
                    <Badge
                      variant={isPresent ? "success" : "destructive"}
                      className="text-xs"
                    >
                      {isPresent ? "Present" : "Absent"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Attendance This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={attendanceMonthlyData.slice(-6)}
                bars={[{ key: "present", color: "#10B981", name: "Present %" }]}
                xKey="name"
                height={160}
                showLegend={false}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Subject Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={subjectPerformanceData.slice(0, 5)}
                bars={[{ key: "average", color: "#7C3AED", name: "Average" }]}
                xKey="subject"
                height={160}
                showLegend={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* My Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">My Assigned Classes</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {myClasses.map((cls) => (
              <div key={cls._id} className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Class {cls.name}{cls.section}</p>
                    <p className="text-xs text-gray-500">{cls.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-600">{cls.studentCount} students</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {cls.subjects.slice(0, 3).map(sub => (
                    <span key={sub} className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {mockNotifications.filter(n => n.targetRole === "staff" || n.targetRole === "all").slice(0, 4).map(notif => (
              <div key={notif._id} className={`flex items-start gap-3 p-3 rounded-xl ${!notif.isRead ? "bg-indigo-50" : "bg-gray-50"}`}>
                <Bell className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                </div>
                {!notif.isRead && <div className="ml-auto w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

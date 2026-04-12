"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatCard from "@/components/shared/StatCard";
import BarChartComponent from "@/components/charts/BarChartComponent";
import LineChartComponent from "@/components/charts/LineChartComponent";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import PieChartComponent from "@/components/charts/PieChartComponent";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users, UserCheck, BookOpen, DollarSign, TrendingUp, Calendar,
  Bell, GraduationCap, AlertTriangle, CheckCircle, Clock, BarChart2
} from "lucide-react";
import {
  mockDashboardStats, enrollmentTrendData, attendanceMonthlyData,
  feeCollectionData, gradeDistributionData, subjectPerformanceData,
  mockStudents, mockNotifications, classWiseStrengthData, feeTypeBreakdownData
} from "@/lib/mock-data";
import { formatCurrency, formatDate, getFeeStatusColor } from "@/lib/utils";

export default function AdminDashboard() {
  const stats = mockDashboardStats;

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      subtitle: `${stats.activeStudents} active`,
      icon: Users,
      gradient: "bg-gradient-to-br from-violet-500 to-purple-700",
      trend: { value: 5.2, label: "vs last year" },
    },
    {
      title: "Total Staff",
      value: stats.totalStaff,
      subtitle: "Teaching & Non-teaching",
      icon: UserCheck,
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-700",
      trend: { value: 8.1, label: "vs last year" },
    },
    {
      title: "Total Classes",
      value: stats.totalClasses,
      subtitle: "Std 6 to 12",
      icon: BookOpen,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-700",
      trend: { value: 2.5, label: "new sections" },
    },
    {
      title: "Fee Collected",
      value: formatCurrency(stats.feeCollectionMonth),
      subtitle: "This month",
      icon: DollarSign,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      trend: { value: 12.3, label: "vs last month" },
    },
    {
      title: "Today's Attendance",
      value: `${stats.attendanceToday}%`,
      subtitle: `${Math.round((stats.totalStudents * stats.attendanceToday) / 100)} present`,
      icon: CheckCircle,
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
      trend: { value: 2.1, label: "vs yesterday" },
    },
    {
      title: "Pending Fees",
      value: formatCurrency(stats.pendingFees),
      subtitle: `${Math.round(stats.pendingFees / 15000)} students`,
      icon: AlertTriangle,
      gradient: "bg-gradient-to-br from-rose-500 to-red-700",
      trend: { value: -8.4, label: "vs last month" },
    },
  ];

  const recentStudents = mockStudents.slice(0, 5);
  const recentNotifications = mockNotifications.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-24" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">Welcome back, Principal! 👋</h2>
              <p className="text-white/70 text-sm">
                Academic Year 2024-2025 • {formatDate(new Date().toISOString())}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.recentAdmissions}</p>
                <p className="text-white/70 text-xs">New Admissions</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.upcomingExams}</p>
                <p className="text-white/70 text-xs">Upcoming Exams</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.notifications}</p>
                <p className="text-white/70 text-xs">Notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            gradient={stat.gradient}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Student Enrollment Trend</CardTitle>
                <CardDescription>Monthly enrollment over the year</CardDescription>
              </div>
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={enrollmentTrendData}
              areas={[{ key: "students", color: "#4F46E5", name: "Students" }]}
              xKey="name"
              height={240}
              showLegend={false}
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Monthly Attendance Overview</CardTitle>
                <CardDescription>Present vs Absent percentage</CardDescription>
              </div>
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={attendanceMonthlyData}
              bars={[
                { key: "present", color: "#10B981", name: "Present %" },
                { key: "absent", color: "#F87171", name: "Absent %" },
              ]}
              xKey="name"
              height={240}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Fee Collection Analysis</CardTitle>
                <CardDescription>Collected vs Pending (₹)</CardDescription>
              </div>
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={feeCollectionData}
              areas={[
                { key: "collected", color: "#4F46E5", name: "Collected (₹)" },
                { key: "pending", color: "#F59E0B", name: "Pending (₹)" },
              ]}
              xKey="name"
              height={240}
              stacked={false}
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-base">Fee Type Breakdown</CardTitle>
              <CardDescription>Distribution by fee category</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={feeTypeBreakdownData}
              height={240}
              innerRadius={50}
              outerRadius={90}
              showLegend={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Class-wise Strength</CardTitle>
                <CardDescription>Number of students per class</CardDescription>
              </div>
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={classWiseStrengthData}
              bars={[{ key: "students", color: "#7C3AED", name: "Students" }]}
              xKey="name"
              height={240}
              showLegend={false}
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Grade Distribution</CardTitle>
                <CardDescription>Overall academic performance</CardDescription>
              </div>
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={gradeDistributionData}
              bars={[{ key: "value", color: "#4F46E5", name: "Students" }]}
              xKey="name"
              height={240}
              showLegend={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Recent Students */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Admissions</CardTitle>
              <a href="/admin/admissions" className="text-xs text-indigo-600 font-medium hover:text-indigo-700">
                View all →
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentStudents.map((student) => (
                <div key={student._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Avatar name={student.name} size="sm" colorIndex={parseInt(student._id.slice(3)) % 8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.studentId} • Class {student.className}</p>
                  </div>
                  <Badge variant={student.fees[0].status === "Paid" ? "success" : student.fees[0].status === "Pending" ? "warning" : "destructive"}>
                    {student.fees[0].status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Notifications</CardTitle>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                {mockNotifications.filter(n => !n.isRead).length} unread
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <div key={notif._id} className={`flex items-start gap-3 p-3 rounded-xl transition-colors ${!notif.isRead ? "bg-indigo-50" : "bg-gray-50 hover:bg-gray-100"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${notif.type === "info" ? "bg-blue-100 text-blue-600" : notif.type === "warning" ? "bg-amber-100 text-amber-600" : notif.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}>
                    <Bell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-gray-900 truncate">{notif.title}</p>
                      {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

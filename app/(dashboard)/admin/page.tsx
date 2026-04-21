"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatCard from "@/components/shared/StatCard";
import BarChartComponent from "@/components/charts/BarChartComponent";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import PieChartComponent from "@/components/charts/PieChartComponent";
import { Avatar } from "@/components/ui/avatar";
import {
  Users, UserCheck, BookOpen, DollarSign, TrendingUp, Calendar,
  GraduationCap, AlertTriangle, CheckCircle, BarChart2, Loader2,
  IndianRupee, UserPlus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
// Fallback chart data shown while DB is empty
import {
  enrollmentTrendData, attendanceMonthlyData, feeCollectionData,
  gradeDistributionData, classWiseStrengthData, feeTypeBreakdownData,
} from "@/lib/mock-data";

interface DashboardStats {
  totalStudents: number;
  totalStaff: number;
  totalClasses: number;
  feeCollectionMonth: number;
  pendingFees: number;
  attendanceToday: number;
}

interface RecentStudent {
  _id: string;
  name: string;
  studentId: string;
  className: string;
  section: string;
}

interface Charts {
  enrollment?:        { name: string; students: number }[]             | null;
  feeCollection?:     { name: string; collected: number; pending: number }[] | null;
  attendance?:        { name: string; present: number; absent: number }[]   | null;
  classStrength?:     { name: string; students: number }[]             | null;
  feeTypeBreakdown?:  { name: string; value: number }[]                | null;
  gradeDistribution?: { name: string; value: number }[]                | null;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [stats, setStats]               = useState<DashboardStats | null>(null);
  const [recentStudents, setRecent]     = useState<RecentStudent[]>([]);
  const [charts, setCharts]             = useState<Charts>({});
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setStats(json.stats);
          setRecent(json.recentStudents ?? []);
          setCharts(json.charts ?? {});
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Chart data — real if available, fallback to mock for better UX
  const enrollmentData = charts.enrollment      || enrollmentTrendData;
  const feeData        = charts.feeCollection   || feeCollectionData;
  const attData        = charts.attendance      || attendanceMonthlyData;
  const classData      = charts.classStrength   || classWiseStrengthData;
  const feeTypeData    = charts.feeTypeBreakdown  || feeTypeBreakdownData;
  const gradeData      = charts.gradeDistribution || gradeDistributionData;

  const statCards = [
    {
      title: t("totalStudentsLabel"),
      value: stats?.totalStudents ?? 0,
      subtitle: t("activeStudentsLabel"),
      icon: Users,
      gradient: "bg-gradient-to-br from-violet-500 to-purple-700",
      trend: { value: 0, label: "enrolled" },
    },
    {
      title: t("totalStaffLabel"),
      value: stats?.totalStaff ?? 0,
      subtitle: "Teachers & Accountants",
      icon: UserCheck,
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-700",
      trend: { value: 0, label: "active" },
    },
    {
      title: t("totalClassesLabel"),
      value: stats?.totalClasses ?? 0,
      subtitle: "Active class groups",
      icon: BookOpen,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-700",
      trend: { value: 0, label: "sections" },
    },
    {
      title: t("feeCollectedLabel"),
      value: formatCurrency(stats?.feeCollectionMonth ?? 0),
      subtitle: "This month",
      icon: DollarSign,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
      trend: { value: 0, label: "this month" },
    },
    {
      title: t("todayAttendanceLabel"),
      value: `${stats?.attendanceToday ?? 0}%`,
      subtitle: t("present"),
      icon: CheckCircle,
      gradient: "bg-gradient-to-br from-cyan-500 to-blue-600",
      trend: { value: 0, label: "today" },
    },
    {
      title: t("pendingFeesLabel"),
      value: formatCurrency(stats?.pendingFees ?? 0),
      subtitle: "Outstanding balance",
      icon: AlertTriangle,
      gradient: "bg-gradient-to-br from-rose-500 to-red-700",
      trend: { value: 0, label: "overdue" },
    },
  ];

  // Build live alerts from real stats
  const alerts: { icon: React.ReactNode; title: string; desc: string; color: string }[] = [];
  if (stats) {
    if (stats.attendanceToday > 0 && stats.attendanceToday < 75) {
      alerts.push({ icon: <AlertTriangle className="w-3.5 h-3.5" />, title: "Low Attendance", desc: `Only ${stats.attendanceToday}% present today`, color: "bg-amber-100 text-amber-600" });
    }
    if (stats.pendingFees > 0) {
      alerts.push({ icon: <IndianRupee className="w-3.5 h-3.5" />, title: "Pending Fees", desc: `${formatCurrency(stats.pendingFees)} outstanding balance`, color: "bg-red-100 text-red-600" });
    }
    if (stats.feeCollectionMonth > 0) {
      alerts.push({ icon: <CheckCircle className="w-3.5 h-3.5" />, title: "Monthly Collection", desc: `${formatCurrency(stats.feeCollectionMonth)} collected this month`, color: "bg-emerald-100 text-emerald-600" });
    }
    if (stats.totalStudents === 0) {
      alerts.push({ icon: <UserPlus className="w-3.5 h-3.5" />, title: "No Students Yet", desc: "Start by enrolling students in the Students module", color: "bg-blue-100 text-blue-600" });
    }
    if (alerts.length === 0) {
      alerts.push({ icon: <CheckCircle className="w-3.5 h-3.5" />, title: "All Good!", desc: "No issues requiring your attention right now", color: "bg-emerald-100 text-emerald-600" });
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-24" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">{t("welcomePrincipal")}</h2>
              <p className="text-white/70 text-sm">
                Academic Year 2025–2026 •{" "}
                {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats?.totalStudents ?? "—"}</p>
                <p className="text-white/70 text-xs">Students</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats?.totalStaff ?? "—"}</p>
                <p className="text-white/70 text-xs">Staff</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold">{stats?.attendanceToday ?? "—"}%</p>
                <p className="text-white/70 text-xs">Attendance Today</p>
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
                <CardTitle className="text-base">{t("enrollmentTrend")}</CardTitle>
                <CardDescription>Monthly admissions over the past year</CardDescription>
              </div>
              <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={enrollmentData}
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
                <CardTitle className="text-base">{t("attendanceOverview")}</CardTitle>
                <CardDescription>Present vs Absent percentage</CardDescription>
              </div>
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={attData}
              bars={[
                { key: "present", color: "#10B981", name: "Present %" },
                { key: "absent",  color: "#F87171", name: "Absent %" },
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
                <CardTitle className="text-base">{t("feeAnalysis")}</CardTitle>
                <CardDescription>Collected vs Pending (₹)</CardDescription>
              </div>
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={feeData}
              areas={[
                { key: "collected", color: "#4F46E5", name: "Collected (₹)" },
                { key: "pending",   color: "#F59E0B", name: "Pending (₹)" },
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
              data={feeTypeData}
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
                <CardTitle className="text-base">{t("classStrengthTitle")}</CardTitle>
                <CardDescription>Number of students per class</CardDescription>
              </div>
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={classData}
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
                <CardTitle className="text-base">{t("gradeDistribution")}</CardTitle>
                <CardDescription>Overall academic performance</CardDescription>
              </div>
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-rose-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <BarChartComponent
              data={gradeData}
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
        {/* Recent Admissions */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t("recentAdmissions")}</CardTitle>
              <a href="/admin/students" className="text-xs text-indigo-600 font-medium hover:text-indigo-700">
                {t("viewAll")} →
              </a>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recentStudents.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
                <Users className="w-8 h-8 opacity-30" />
                <p className="text-sm">No students enrolled yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentStudents.map((student) => (
                  <div key={student._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Avatar name={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.studentId} • Class {student.className} – {student.section}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* School Status / Live Alerts */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">School Status</CardTitle>
              <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">
                Live
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${alert.color}`}>
                    {alert.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{alert.desc}</p>
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

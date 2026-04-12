"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BarChartComponent from "@/components/charts/BarChartComponent";
import LineChartComponent from "@/components/charts/LineChartComponent";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import PieChartComponent from "@/components/charts/PieChartComponent";
import RadarChartComponent from "@/components/charts/RadarChartComponent";
import {
  attendanceMonthlyData, enrollmentTrendData, feeCollectionData,
  gradeDistributionData, subjectPerformanceData, mockClasses,
  weeklyAttendanceData, feeTypeBreakdownData, mockStudents
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Download, BarChart3, Users, DollarSign, GraduationCap, FileText } from "lucide-react";

const topStudents = mockStudents
  .filter(s => s.attendance && s.attendance.percentage >= 90)
  .slice(0, 5)
  .map((s, i) => ({
    name: s.name,
    class: s.className,
    attendance: s.attendance!.percentage,
    rank: i + 1,
  }));

export default function ReportsPage() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Reports & Analytics</h2>
              <p className="text-white/60 text-sm">Academic Year 2024-2025 • Comprehensive Analytics</p>
            </div>
            <div className="flex gap-2">
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20 border gap-2" variant="outline" size="sm">
                <Download className="w-4 h-4" /> Export PDF
              </Button>
              <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20 border gap-2" variant="outline" size="sm">
                <Download className="w-4 h-4" /> Export Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="academic">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="academic">
            <GraduationCap className="w-4 h-4 mr-1.5" /> Academic
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Users className="w-4 h-4 mr-1.5" /> Attendance
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="w-4 h-4 mr-1.5" /> Financial
          </TabsTrigger>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-1.5" /> Overview
          </TabsTrigger>
        </TabsList>

        {/* Academic Reports */}
        <TabsContent value="academic">
          <div className="space-y-5">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Grade Distribution — All Classes</CardTitle>
                  <CardDescription>Number of students per grade category</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={gradeDistributionData}
                    bars={[{ key: "value", color: "#4F46E5", name: "Students" }]}
                    xKey="name"
                    height={260}
                    showLegend={false}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Subject-wise Average Performance</CardTitle>
                  <CardDescription>Average marks per subject across all classes</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={subjectPerformanceData}
                    bars={[{ key: "average", color: "#7C3AED", name: "Average Score" }]}
                    xKey="subject"
                    height={260}
                    showLegend={false}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Card className="xl:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Enrollment Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChartComponent
                    data={enrollmentTrendData}
                    lines={[{ key: "students", color: "#4F46E5", name: "Students" }]}
                    xKey="name"
                    height={240}
                    referenceValue={400}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Grade Pie Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChartComponent
                    data={gradeDistributionData}
                    height={240}
                    innerRadius={60}
                    outerRadius={90}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Top Students */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Performing Students (Attendance)</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {topStudents.map((student, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-amber-700" : "bg-indigo-400"}`}>
                        {student.rank}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">Class {student.class}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${student.attendance}%` }} />
                        </div>
                        <span className="text-sm font-bold text-emerald-600">{student.attendance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Attendance Reports */}
        <TabsContent value="attendance">
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Avg Attendance", value: "88.4%", color: "text-emerald-600" },
                { label: "Total Working Days", value: "180", color: "text-blue-600" },
                { label: "Days Completed", value: "142", color: "text-purple-600" },
                { label: "Below 75%", value: "23", color: "text-red-600" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Monthly Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChartComponent
                    data={attendanceMonthlyData}
                    areas={[
                      { key: "present", color: "#10B981", name: "Present %" },
                      { key: "absent", color: "#F87171", name: "Absent %" },
                    ]}
                    xKey="name"
                    height={260}
                    stacked
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Weekly Attendance (Gender-wise)</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChartComponent
                    data={weeklyAttendanceData}
                    bars={[
                      { key: "male", color: "#3B82F6", name: "Male" },
                      { key: "female", color: "#EC4899", name: "Female" },
                    ]}
                    xKey="day"
                    height={260}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial">
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Annual Target", value: formatCurrency(32000000), color: "text-blue-600" },
                { label: "Collected YTD", value: formatCurrency(24800000), color: "text-emerald-600" },
                { label: "Pending", value: formatCurrency(680000), color: "text-amber-600" },
                { label: "Achievement", value: "77.5%", color: "text-purple-600" },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4 text-center">
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <Card className="xl:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fee Collection Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <AreaChartComponent
                    data={feeCollectionData}
                    areas={[
                      { key: "collected", color: "#10B981", name: "Collected" },
                      { key: "pending", color: "#F59E0B", name: "Pending" },
                    ]}
                    height={260}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Fee Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChartComponent
                    data={feeTypeBreakdownData}
                    height={260}
                    innerRadius={55}
                    outerRadius={90}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Class-wise Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={mockClasses.map(c => ({ name: `${c.name}${c.section}`, students: c.studentCount }))}
                  bars={[{ key: "students", color: "#4F46E5", name: "Students" }]}
                  xKey="name"
                  height={280}
                  showLegend={false}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Subject Performance Radar</CardTitle>
                <CardDescription>Average class performance by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <RadarChartComponent
                  data={[
                    { subject: "Tamil", score: 78, fullMark: 100 },
                    { subject: "English", score: 82, fullMark: 100 },
                    { subject: "Maths", score: 71, fullMark: 100 },
                    { subject: "Science", score: 76, fullMark: 100 },
                    { subject: "Social", score: 80, fullMark: 100 },
                    { subject: "Computer", score: 85, fullMark: 100 },
                  ]}
                  height={280}
                />
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Year-over-year Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  data={[
                    { month: "Jun", current: 380, previous: 340 },
                    { month: "Jul", current: 395, previous: 355 },
                    { month: "Aug", current: 398, previous: 362 },
                    { month: "Sep", current: 402, previous: 370 },
                    { month: "Oct", current: 405, previous: 375 },
                    { month: "Nov", current: 408, previous: 378 },
                    { month: "Dec", current: 406, previous: 372 },
                    { month: "Jan", current: 410, previous: 385 },
                    { month: "Feb", current: 412, previous: 390 },
                    { month: "Mar", current: 412, previous: 392 },
                  ]}
                  lines={[
                    { key: "current", color: "#4F46E5", name: "2024-25" },
                    { key: "previous", color: "#10B981", name: "2023-24" },
                  ]}
                  xKey="month"
                  height={280}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

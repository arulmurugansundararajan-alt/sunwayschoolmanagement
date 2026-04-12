"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BarChartComponent from "@/components/charts/BarChartComponent";
import LineChartComponent from "@/components/charts/LineChartComponent";
import RadarChartComponent from "@/components/charts/RadarChartComponent";
import { mockMarksRecords, mockStudents, subjectPerformanceData, studentPerformanceRadarData } from "@/lib/mock-data";
import { calculateGrade, getGradeColor } from "@/lib/utils";
import { ExamType, Grade } from "@/types";
import { Trophy, TrendingUp, BookOpen } from "lucide-react";

const myChild = mockStudents[0];
const allMarks = mockMarksRecords.filter(m => m.studentId === myChild._id);

const subjects = ["Mathematics", "Science", "English", "Social Science", "Tamil"];
const examTypes: ExamType[] = ["Unit Test 1", "Unit Test 2", "Mid Term", "Final" as ExamType];

// Build subject-wise data
const subjectData = subjects.map(sub => {
  const subMarks = allMarks.filter(m => m.subject === sub);
  const avg = subMarks.length > 0
    ? Math.round(subMarks.reduce((a, m) => a + (m.marksObtained / m.maxMarks) * 100, 0) / subMarks.length)
    : Math.floor(60 + Math.random() * 30);
  const latest = subMarks[subMarks.length - 1];
  return {
    subject: sub,
    shortName: sub.substring(0, 5),
    average: avg,
    latest: latest ? Math.round((latest.marksObtained / latest.maxMarks) * 100) : avg,
    grade: calculateGrade(avg, 100),
  };
});

// Build exam comparison data
const examCompData = examTypes.map(exam => {
  const row: Record<string, number | string> = { exam };
  subjects.forEach(sub => {
    const rec = allMarks.find(m => m.subject === sub && m.examType === exam);
    row[sub.substring(0, 4)] = rec ? Math.round((rec.marksObtained / rec.maxMarks) * 100) : null as any;
  });
  return row;
});

const colors = ["#9333EA", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function ParentPerformancePage() {
  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {subjectData.map(s => (
          <div key={s.subject} className="bg-white rounded-2xl border p-4 flex flex-col items-center gap-1.5 shadow-sm">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 font-medium text-center leading-tight">{s.subject}</p>
            <p className="text-2xl font-extrabold text-gray-900">{s.average}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getGradeColor(s.grade as Grade)}`}>{s.grade}</span>
          </div>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exams">Exam Comparison</TabsTrigger>
          <TabsTrigger value="details">Marks Detail</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Subject-wise Average</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={subjectData.map(s => ({ name: s.shortName, average: s.average }))}
                  bars={[{ key: "average", color: "#9333EA", name: "Average %" }]}
                  xKey="name"
                  height={220}
                  showLegend={false}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChartComponent
                  data={studentPerformanceRadarData}
                  lines={[{ key: "student", color: "#9333EA", name: myChild.name }]}
                  height={220}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="exams">
          <div className="mt-4 space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Performance Across Exams</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChartComponent
                  data={examCompData.filter(d => subjects.some(s => d[s.substring(0, 4)] != null))}
                  lines={subjects.map((sub, i) => ({ key: sub.substring(0, 4), color: colors[i], name: sub }))}
                  xKey="exam"
                  height={250}
                />
              </CardContent>
            </Card>

            {/* Per exam breakdown */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {examTypes.map(exam => {
                const examMarks = allMarks.filter(m => m.examType === exam);
                const avg = examMarks.length > 0
                  ? Math.round(examMarks.reduce((a, m) => a + (m.marksObtained / m.maxMarks) * 100, 0) / examMarks.length)
                  : 0;
                const grade = avg > 0 ? calculateGrade(avg, 100) : "-";
                return (
                  <div key={exam} className="bg-white border rounded-2xl p-4 text-center shadow-sm">
                    <p className="text-xs font-medium text-gray-500 mb-1">{exam}</p>
                    <p className="text-3xl font-bold text-gray-900">{avg || "—"}</p>
                    {avg > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${getGradeColor(grade as Grade)}`}>{grade}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="mt-4 space-y-3">
            {examTypes.map(exam => {
              const examMarks = allMarks.filter(m => m.examType === exam);
              return (
                <Card key={exam}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      {exam}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left py-2 text-xs text-gray-500 font-semibold">Subject</th>
                            <th className="text-center py-2 text-xs text-gray-500 font-semibold">Marks</th>
                            <th className="text-center py-2 text-xs text-gray-500 font-semibold">%</th>
                            <th className="text-center py-2 text-xs text-gray-500 font-semibold">Grade</th>
                            <th className="hidden sm:table-cell py-2 pr-2 text-xs text-gray-500 font-semibold">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subjects.map(sub => {
                            const rec = examMarks.find(m => m.subject === sub);
                            const pct = rec ? Math.round((rec.marksObtained / rec.maxMarks) * 100) : null;
                            const grade = pct !== null ? calculateGrade(pct, 100) : null;
                            return (
                              <tr key={sub} className="border-b border-gray-50 last:border-0">
                                <td className="py-2.5 font-medium text-gray-800">{sub}</td>
                                <td className="py-2.5 text-center text-gray-600">
                                  {rec ? `${rec.marksObtained}/${rec.maxMarks}` : "—"}
                                </td>
                                <td className="py-2.5 text-center font-semibold text-gray-800">
                                  {pct !== null ? `${pct}%` : "—"}
                                </td>
                                <td className="py-2.5 text-center">
                                  {grade ? (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getGradeColor(grade as Grade)}`}>{grade}</span>
                                  ) : "—"}
                                </td>
                                <td className="py-2.5 pr-2 hidden sm:table-cell">
                                  {pct !== null && (
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

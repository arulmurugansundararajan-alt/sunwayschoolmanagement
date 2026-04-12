"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { mockClasses, mockStudents, mockAttendanceRecords } from "@/lib/mock-data";
import { AttendanceStatus } from "@/types";
import { Check, X, Clock, CheckCheck, RotateCcw, Save, ChevronLeft, ChevronRight } from "lucide-react";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { attendanceMonthlyData } from "@/lib/mock-data";

type AttRecord = { studentId: string; status: AttendanceStatus };

const classes = mockClasses.slice(0, 3);

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function StaffAttendancePage() {
  const today = new Date();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]._id);
  const [selectedDate, setSelectedDate] = useState<string>(toDateStr(today));
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);

  const students = mockStudents.filter(s => s.classId === selectedClassId).slice(0, 15);
  const selectedClass = classes.find(c => c._id === selectedClassId);

  // Pre-fill with mock values so UI is not empty
  const getStatus = (studentId: string): AttendanceStatus => {
    if (attendance[studentId]) return attendance[studentId];
    const mockRec = mockAttendanceRecords.find(r => r.studentId === studentId);
    if (mockRec) return mockRec.status;
    return "Present";
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setSaved(false);
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const all: Record<string, AttendanceStatus> = {};
    students.forEach(s => { all[s._id] = status; });
    setAttendance(all);
    setSaved(false);
  };

  const counts = {
    Present: students.filter(s => getStatus(s._id) === "Present").length,
    Absent: students.filter(s => getStatus(s._id) === "Absent").length,
    Late: students.filter(s => getStatus(s._id) === "Late").length,
  };

  const offsets = [-2, -1, 0, 1, 2];
  const calDays = offsets.map(o => {
    const d = new Date(today);
    d.setDate(d.getDate() + o);
    return d;
  });

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {classes.map(cls => (
            <button
              key={cls._id}
              onClick={() => { setSelectedClassId(cls._id); setAttendance({}); setSaved(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedClassId === cls._id
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Class {cls.name}{cls.section}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={selectedDate}
          max={toDateStr(today)}
          onChange={e => { setSelectedDate(e.target.value); setAttendance({}); setSaved(false); }}
          className="ml-auto px-3 py-2 rounded-xl border border-gray-200 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Student List */}
        <div className="xl:col-span-2 space-y-3">
          {/* Summary Strip */}
          <div className="flex gap-3">
            {[
              { label: "Present", count: counts.Present, color: "bg-emerald-100 text-emerald-700" },
              { label: "Absent", count: counts.Absent, color: "bg-red-100 text-red-700" },
              { label: "Late", count: counts.Late, color: "bg-amber-100 text-amber-700" },
            ].map(item => (
              <div key={item.label} className={`flex-1 items-center text-center py-3 rounded-xl ${item.color}`}>
                <p className="text-2xl font-bold">{item.count}</p>
                <p className="text-xs font-semibold">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="success" onClick={() => markAll("Present")}>
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" /> Mark All Present
            </Button>
            <Button size="sm" variant="destructive" onClick={() => markAll("Absent")}>
              <X className="w-3.5 h-3.5 mr-1.5" /> Mark All Absent
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setAttendance({}); setSaved(false); }}>
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
            </Button>
            <Button size="sm" variant="default" onClick={() => setSaved(true)} className="ml-auto">
              <Save className="w-3.5 h-3.5 mr-1.5" /> Save Attendance
            </Button>
          </div>

          {saved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
              <Check className="w-4 h-4" />
              Attendance saved successfully for {selectedDate}!
            </div>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Class {selectedClass?.name}{selectedClass?.section} — {selectedDate}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1.5">
              {students.map((student, i) => {
                const status = getStatus(student._id);
                return (
                  <div key={student._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 group">
                    <Avatar name={student.name} size="sm" colorIndex={i % 8} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-400">Roll #{student.rollNumber}</p>
                    </div>
                    <div className="flex gap-1.5">
                      {(["Present", "Absent", "Late"] as AttendanceStatus[]).map(s => {
                        const styles: Record<AttendanceStatus, string> = {
                          Present: "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200",
                          Absent: "bg-red-100 text-red-700 border-red-300 hover:bg-red-200",
                          Late: "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200",
                        };
                        const activeStyles: Record<AttendanceStatus, string> = {
                          Present: "bg-emerald-600 !text-white border-emerald-600",
                          Absent: "bg-red-600 !text-white border-red-600",
                          Late: "bg-amber-500 !text-white border-amber-500",
                        };
                        return (
                          <button
                            key={s}
                            onClick={() => setStatus(student._id, s)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${styles[s]} ${status === s ? activeStyles[s] : ""}`}
                          >
                            {s === "Present" ? "P" : s === "Absent" ? "A" : "L"}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Mini Calendar */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Date Nav</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5">
                {calDays.map(d => {
                  const ds = toDateStr(d);
                  const isSelected = ds === selectedDate;
                  const isToday = ds === toDateStr(today);
                  const isFuture = d > today;
                  return (
                    <button
                      key={ds}
                      disabled={isFuture}
                      onClick={() => { if (!isFuture) { setSelectedDate(ds); setAttendance({}); setSaved(false); } }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        isSelected ? "bg-emerald-600 text-white font-bold" :
                        isFuture ? "text-gray-300 cursor-not-allowed" :
                        "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="flex-1 text-left">
                        {d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
                      </span>
                      {isToday && !isSelected && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Today</span>}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChartComponent
                data={attendanceMonthlyData.slice(-5)}
                bars={[
                  { key: "present", color: "#10B981", name: "Present %" },
                  { key: "absent", color: "#EF4444", name: "Absent %" },
                ]}
                xKey="name"
                height={160}
                showLegend={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

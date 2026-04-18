"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockTimetable, mockClasses } from "@/lib/mock-data";
import { getSubjectColor } from "@/lib/utils";
import { Clock, Plus, Calendar } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const periodTimes: Record<number, string> = {
  1: "8:00 - 8:45",
  2: "8:45 - 9:30",
  3: "9:30 - 10:15",
  4: "10:30 - 11:15",
  5: "11:15 - 12:00",
  6: "1:00 - 1:45",
  7: "1:45 - 2:30",
  8: "2:30 - 3:15",
};

const breakPeriods = [3.5]; // After period 3

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState("cls1");

  const classSlots = mockTimetable.filter((slot) => slot.classId === selectedClass);
  const selectedClassInfo = mockClasses.find((c) => c._id === selectedClass);

  const getSlot = (day: string, period: number) => {
    return classSlots.find((s) => s.day === day && s.period === period);
  };

  return (
    <div className="space-y-5">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Timetable Management</p>
                <p className="text-xs text-gray-500">Academic Year 2024-2025</p>
              </div>
            </div>
            <div className="flex gap-3 ml-auto">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {mockClasses.map((c) => (
                  <option key={c._id} value={c._id}>
                    Class {c.name}{c.section}
                  </option>
                ))}
              </select>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add Period
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Class Info */}
      {selectedClassInfo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Class", value: `${selectedClassInfo.name} ${selectedClassInfo.section}` },
            { label: "Class Teacher", value: selectedClassInfo.classTeacherName.split(" ").slice(-1)[0] },
            { label: "Room", value: selectedClassInfo.room },
            { label: "Students", value: selectedClassInfo.studentCount },
          ].map((info) => (
            <Card key={info.label} className="bg-gradient-to-br from-gray-50 to-white">
              <CardContent className="p-3">
                <p className="text-xs text-gray-500">{info.label}</p>
                <p className="font-semibold text-gray-900 mt-0.5">{info.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Timetable Grid */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Weekly Timetable — Class {selectedClassInfo?.name}{selectedClassInfo?.section}
          </CardTitle>
          <CardDescription>Click on a period to edit</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24 border-r border-gray-200">
                  Period
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="py-3 px-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period, idx) => (
                <React.Fragment key={idx}>
                  {period === 4 && (
                    <tr key="break1">
                      <td colSpan={6} className="py-1.5 px-3 bg-amber-50 border-y border-amber-200 text-center text-xs font-semibold text-amber-700">
                        ☕ Morning Break (10:15 - 10:30)
                      </td>
                    </tr>
                  )}
                  {period === 6 && (
                    <tr key="break2">
                      <td colSpan={6} className="py-1.5 px-3 bg-emerald-50 border-y border-emerald-200 text-center text-xs font-semibold text-emerald-700">
                        🍱 Lunch Break (12:00 - 1:00)
                      </td>
                    </tr>
                  )}
                  <tr key={period} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3 border-r border-gray-200">
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">{period}</p>
                        <p className="text-xs text-gray-400">{periodTimes[period]}</p>
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const slot = getSlot(day, period);
                      return (
                        <td key={day} className="py-2 px-2 border-r border-gray-100 last:border-r-0">
                          {slot ? (
                            <div
                              className={`rounded-xl p-2 text-center cursor-pointer hover:shadow-md transition-all border ${getSubjectColor(slot.subject)}`}
                            >
                              <p className="text-xs font-bold">{slot.subject}</p>
                              <p className="text-xs opacity-70 mt-0.5 truncate">
                                {slot.staffName.split(" ").slice(-1)[0]}
                              </p>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-2 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all">
                              <p className="text-xs text-gray-300">Free</p>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <p className="text-xs font-semibold text-gray-600 mb-3">Subject Color Legend</p>
          <div className="flex flex-wrap gap-2">
            {["Tamil", "English", "Mathematics", "Science", "Social Science", "Computer Science", "Physical Education", "Physics", "Chemistry", "Biology"].map((sub) => (
              <span key={sub} className={`text-xs px-2.5 py-1 rounded-full border ${getSubjectColor(sub)}`}>
                {sub}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogCloseButton
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockStudents, mockClasses } from "@/lib/mock-data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Search, Plus, Eye, Edit, Download, Filter, Users, UserCheck, AlertTriangle } from "lucide-react";

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof mockStudents[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const filtered = mockStudents.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(search.toLowerCase());
    const matchClass = !selectedClass || s.classId === selectedClass;
    return matchSearch && matchClass;
  });

  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{mockStudents.length}</p>
              <p className="text-xs text-gray-600">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-700">{mockStudents.filter(s => s.isActive).length}</p>
              <p className="text-xs text-gray-600">Active Students</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-700">{mockStudents.filter(s => s.fees[0].status !== "Paid").length}</p>
              <p className="text-xs text-gray-600">Pending Fees</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search by name, ID, admission number..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[160px]"
            >
              <option value="">All Classes</option>
              {mockClasses.map((c) => (
                <option key={c._id} value={c._id}>
                  Class {c.name}{c.section}
                </option>
              ))}
            </select>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Add Student
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Showing {paginated.length} of {filtered.length} students
          </p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Attendance</TableHead>
              <TableHead>Fee Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((student) => (
              <TableRow key={student._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={student.name} size="sm" colorIndex={parseInt(student._id.slice(3)) % 8} />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{student.name}</p>
                      <p className="text-xs text-gray-500">Roll #{student.rollNumber}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg font-mono font-medium">
                    {student.studentId}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="info">Class {student.className}</Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-gray-700">{student.parentName}</p>
                  <p className="text-xs text-gray-500">{student.parentPhone}</p>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 w-16">
                      <div
                        className={`h-1.5 rounded-full ${student.attendance!.percentage >= 90 ? "bg-emerald-500" : student.attendance!.percentage >= 75 ? "bg-blue-500" : "bg-red-500"}`}
                        style={{ width: `${student.attendance!.percentage}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold ${student.attendance!.percentage >= 90 ? "text-emerald-600" : student.attendance!.percentage >= 75 ? "text-blue-600" : "text-red-600"}`}>
                      {student.attendance!.percentage}%
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      student.fees[0].status === "Paid" ? "success" :
                      student.fees[0].status === "Pending" ? "warning" :
                      student.fees[0].status === "Partial" ? "info" : "destructive"
                    }
                  >
                    {student.fees[0].status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={student.isActive ? "success" : "secondary"}>
                    {student.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={page === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
                className="w-8 p-0"
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <Dialog open={!!selectedStudent} onClose={() => setSelectedStudent(null)} maxWidth="xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogCloseButton onClose={() => setSelectedStudent(null)} />
          </DialogHeader>
          <DialogContent>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <Avatar name={selectedStudent.name} size="xl" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-600">{selectedStudent.studentId} • {selectedStudent.admissionNumber}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="info">Class {selectedStudent.className}</Badge>
                    <Badge variant={selectedStudent.isActive ? "success" : "secondary"}>
                      {selectedStudent.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Personal Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Date of Birth</span>
                      <span className="font-medium">{formatDate(selectedStudent.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Gender</span>
                      <span className="font-medium">{selectedStudent.gender}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Blood Group</span>
                      <span className="font-medium">{selectedStudent.bloodGroup}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Admission Date</span>
                      <span className="font-medium">{formatDate(selectedStudent.admissionDate)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Parent Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Parent Name</span>
                      <span className="font-medium">{selectedStudent.parentName}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-gray-500">Phone</span>
                      <span className="font-medium">{selectedStudent.parentPhone}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium text-xs">{selectedStudent.parentEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Summary */}
              {selectedStudent.attendance && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Attendance Summary</h4>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Total Days", value: selectedStudent.attendance.totalDays, color: "bg-blue-50 text-blue-700" },
                      { label: "Present", value: selectedStudent.attendance.presentDays, color: "bg-emerald-50 text-emerald-700" },
                      { label: "Absent", value: selectedStudent.attendance.absentDays, color: "bg-red-50 text-red-700" },
                      { label: "Percentage", value: `${selectedStudent.attendance.percentage}%`, color: "bg-purple-50 text-purple-700" },
                    ].map((item) => (
                      <div key={item.label} className={`${item.color} rounded-xl p-3 text-center`}>
                        <p className="text-xl font-bold">{item.value}</p>
                        <p className="text-xs mt-0.5 opacity-80">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fees */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Fee Records</h4>
                <div className="space-y-2">
                  {selectedStudent.fees.map((fee) => (
                    <div key={fee._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{fee.feeType}</p>
                        <p className="text-xs text-gray-500">Due: {formatDate(fee.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(fee.amount)}</p>
                        <Badge
                          variant={fee.status === "Paid" ? "success" : fee.status === "Pending" ? "warning" : "destructive"}
                        >
                          {fee.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
            <Button>Edit Student</Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}

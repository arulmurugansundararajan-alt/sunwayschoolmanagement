"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogCloseButton
} from "@/components/ui/dialog";
import { mockStaff } from "@/lib/mock-data";
import { formatDate, getSubjectColor } from "@/lib/utils";
import { Search, Plus, Eye, Edit, Phone, Mail, Award, Users } from "lucide-react";

export default function StaffManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<typeof mockStaff[0] | null>(null);

  const departments = [...new Set(mockStaff.map(s => s.department))];

  const filtered = mockStaff.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.staffId.toLowerCase().includes(search.toLowerCase()) ||
      s.designation.toLowerCase().includes(search.toLowerCase());
    const matchDept = !selectedDept || s.department === selectedDept;
    return matchSearch && matchDept;
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: mockStaff.length, color: "from-indigo-500 to-purple-600", icon: Users },
          { label: "Teachers", value: mockStaff.filter(s => s.designation.includes("Teacher")).length, color: "from-emerald-500 to-teal-600", icon: Award },
          { label: "HODs", value: mockStaff.filter(s => s.designation === "HOD").length, color: "from-amber-500 to-orange-600", icon: Award },
          { label: "Departments", value: departments.length, color: "from-blue-500 to-cyan-600", icon: Users },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-lg`}>
            <CardContent className="p-4">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-white/70 text-sm mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search staff by name, ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="flex-1"
            />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Staff
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">{filtered.length} staff members found</p>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((staff) => (
              <TableRow key={staff._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={staff.name} size="sm" colorIndex={parseInt(staff._id.slice(3)) % 8} />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg font-mono font-medium">
                    {staff.staffId}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={staff.designation === "HOD" || staff.designation === "Vice Principal" ? "purple" : "info"}>
                    {staff.designation}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-700">{staff.department}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {staff.subjects.slice(0, 2).map((sub) => (
                      <span key={sub} className={`text-xs px-1.5 py-0.5 rounded-md border ${getSubjectColor(sub)}`}>
                        {sub}
                      </span>
                    ))}
                    {staff.subjects.length > 2 && (
                      <span className="text-xs text-gray-500">+{staff.subjects.length - 2}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-gray-700">{staff.experience} yrs</span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => setSelectedStaff(staff)}>
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
      </Card>

      {/* Staff Detail Modal */}
      {selectedStaff && (
        <Dialog open={!!selectedStaff} onClose={() => setSelectedStaff(null)} maxWidth="lg">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
            <DialogCloseButton onClose={() => setSelectedStaff(null)} />
          </DialogHeader>
          <DialogContent>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl mb-4">
              <Avatar name={selectedStaff.name} size="xl" colorIndex={2} />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedStaff.name}</h3>
                <p className="text-sm text-gray-600">{selectedStaff.staffId} • {selectedStaff.designation}</p>
                <p className="text-sm text-emerald-600 font-medium">{selectedStaff.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: "Email", value: selectedStaff.email, icon: Mail },
                { label: "Phone", value: selectedStaff.phone, icon: Phone },
                { label: "Qualifications", value: selectedStaff.qualifications, icon: Award },
                { label: "Experience", value: `${selectedStaff.experience} years`, icon: Award },
                { label: "Joining Date", value: formatDate(selectedStaff.dateOfJoining), icon: Award },
                { label: "Gender", value: selectedStaff.gender, icon: Users },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-3.5 h-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">{item.label}</p>
                    <p className="font-medium text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Subjects Teaching</p>
              <div className="flex flex-wrap gap-2">
                {selectedStaff.subjects.map((sub) => (
                  <span key={sub} className={`text-xs px-2.5 py-1 rounded-full border ${getSubjectColor(sub)}`}>
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </DialogContent>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStaff(null)}>Close</Button>
            <Button>Edit Profile</Button>
          </DialogFooter>
        </Dialog>
      )}
    </div>
  );
}

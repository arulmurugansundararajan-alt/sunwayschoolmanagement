"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogCloseButton
} from "@/components/ui/dialog";
import { mockStudents, mockClasses } from "@/lib/mock-data";
import { formatDate, cn } from "@/lib/utils";
import {
  Search, Plus, UserPlus, GraduationCap, Calendar, CheckCircle
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

const ADMISSION_STEPS = ["Personal Info", "Academic & Parent", "Fee & Documents"];

export default function AdmissionsPage() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const recentAdmissions = mockStudents
    .slice(0, 12)
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime());

  const filtered = recentAdmissions.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setFormStep(1);
      setSubmitted(false);
    }, 2000);
  };

  return (
    <div className="space-y-5">
      {/* Banner */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Student Admissions 2024-25</h2>
              <p className="text-white/70 text-sm">Current enrollment: {mockStudents.length} students</p>
              <div className="flex items-center gap-4 mt-3">
                <div>
                  <p className="text-2xl font-bold">412</p>
                  <p className="text-white/60 text-xs">Total Enrolled</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-white/60 text-xs">This Month</p>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-white/60 text-xs">Pending</p>
                </div>
              </div>
            </div>
            <Button
              className="bg-white text-indigo-700 hover:bg-white/90 shadow-lg font-semibold gap-2"
              onClick={() => setShowModal(true)}
            >
              <UserPlus className="w-4 h-4" />
              New Admission
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Search by name or admission number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="flex-1"
            />
            <Button variant="outline" size="sm">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Class Capacity */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {mockClasses.slice(0, 10).map((cls) => {
          const capacity = 50;
          const pct = Math.round((cls.studentCount / capacity) * 100);
          return (
            <Card
              key={cls._id}
              className={`hover:shadow-md transition-shadow ${pct >= 90 ? "border-red-200" : pct >= 75 ? "border-amber-200" : "border-gray-200"}`}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-900">Std {cls.name}{cls.section}</p>
                  <Badge variant={pct >= 90 ? "destructive" : pct >= 75 ? "warning" : "success"} className="text-xs">
                    {pct}%
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mb-2">{cls.studentCount}/{capacity} students</p>
                <div className="bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Admissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Admissions</CardTitle>
          <CardDescription>{filtered.length} records</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((student) => (
              <div
                key={student._id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-100"
              >
                <Avatar name={student.name} size="md" colorIndex={parseInt(student._id.slice(3)) % 8} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.admissionNumber}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="info" className="text-xs">{student.className}</Badge>
                    <span className="text-xs text-gray-400">{formatDate(student.admissionDate)}</span>
                  </div>
                </div>
                <Badge variant={student.isActive ? "success" : "secondary"}>
                  {student.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* New Admission Modal */}
      <Dialog open={showModal} onClose={() => { setShowModal(false); setFormStep(1); }} maxWidth="2xl">
        <DialogHeader>
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {ADMISSION_STEPS.map((label, i) => (
              <>
                <div key={label} className="flex items-center gap-1.5 flex-shrink-0">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all",
                    formStep > i + 1 ? "bg-purple-600 text-white" :
                    formStep === i + 1 ? "bg-purple-600 text-white ring-4 ring-purple-100" :
                    "bg-gray-200 text-gray-500"
                  )}>
                    {formStep > i + 1 ? "✓" : i + 1}
                  </div>
                  <span className={cn(
                    "text-xs font-medium hidden sm:block",
                    formStep === i + 1 ? "text-purple-700" :
                    formStep > i + 1 ? "text-gray-500" : "text-gray-400"
                  )}>{label}</span>
                </div>
                {i < ADMISSION_STEPS.length - 1 && (
                  <div className={cn("flex-1 h-0.5 mx-1 min-w-[12px]", formStep > i + 1 ? "bg-purple-400" : "bg-gray-200")} />
                )}
              </>
            ))}
          </div>
          <DialogCloseButton onClose={() => { setShowModal(false); setFormStep(1); }} />
        </DialogHeader>

        <DialogContent>
          {submitted ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Admission Successful!</h3>
              <p className="text-gray-500 text-sm">Student has been enrolled. ID: PA2024{String(Math.floor(Math.random() * 1000)).padStart(4, "0")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {formStep === 1 && (
                <>
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Student Personal Information</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Full Name *</label>
                    <Input placeholder="Student's full name" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Date of Birth *</label>
                    <Input type="date" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Gender *</label>
                    <select className="flex-1 h-10 px-3 border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                    <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0 text-right">Blood Group</label>
                    <select className="flex-1 h-10 px-3 border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                      <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Phone</label>
                    <Input placeholder="Student's phone" className="flex-1" />
                    <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0 text-right">Email</label>
                    <Input type="email" placeholder="student@email.com" className="flex-1" />
                  </div>
                  <div className="flex items-start gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right mt-2">Address</label>
                    <textarea
                      className="flex-1 px-3 py-2 border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-16 resize-none"
                      placeholder="Full residential address"
                    />
                  </div>
                </>
              )}

              {formStep === 2 && (
                <>
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Academic &amp; Parent Information</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Class *</label>
                    <select className="flex-1 h-10 px-3 border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      {mockClasses.map(c => <option key={c._id} value={c._id}>Class {c.name}{c.section}</option>)}
                    </select>
                    <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0 text-right">Admission Date *</label>
                    <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Parent Name *</label>
                    <Input placeholder="Parent's full name" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Parent Phone *</label>
                    <Input placeholder="Parent phone number" className="flex-1" />
                    <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0 text-right">Relation</label>
                    <Input placeholder="Father / Mother / Guardian" className="flex-1" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Parent Email</label>
                    <Input type="email" placeholder="parent@email.com" className="flex-1" />
                  </div>
                </>
              )}

              {formStep === 3 && (
                <>
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                    <span className="w-2 h-2 bg-purple-600 rounded-full" />
                    <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Fee &amp; Documents</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium text-gray-500 w-32 flex-shrink-0 text-right">Fee Category</label>
                    <select className="flex-1 h-10 px-3 border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option>General</option>
                      <option>Scholarship 25%</option>
                      <option>Scholarship 50%</option>
                      <option>Staff Ward</option>
                    </select>
                    <label className="text-xs font-medium text-gray-500 w-24 flex-shrink-0 text-right">Admission Fee</label>
                    <Input type="number" defaultValue="2000" className="flex-1" />
                  </div>
                  <div className="mt-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Documents Checklist</p>
                    <div className="grid grid-cols-2 gap-2">
                      {["Birth Certificate", "Transfer Certificate", "Aadhaar Card", "Photo (2 copies)", "Previous Mark Sheet", "Caste Certificate"].map((doc) => (
                        <label key={doc} className="flex items-center gap-2 p-2 bg-gray-50 cursor-pointer hover:bg-gray-100">
                          <input type="checkbox" className="rounded" />
                          <span className="text-xs text-gray-700">{doc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>

        {!submitted && (
          <DialogFooter>
            {formStep > 1 && (
              <Button variant="outline" onClick={() => setFormStep(formStep - 1)}>
                Back
              </Button>
            )}
            <Button
              onClick={() => formStep < 3 ? setFormStep(formStep + 1) : handleSubmit()}
            >
              {formStep < 3 ? "Continue" : "Submit Admission"}
            </Button>
          </DialogFooter>
        )}
      </Dialog>
    </div>
  );
}

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
import { formatDate } from "@/lib/utils";
import {
  Search, Plus, UserPlus, GraduationCap, Calendar, CheckCircle
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

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
          <div>
            <DialogTitle>New Student Admission</DialogTitle>
            <p className="text-xs text-gray-500 mt-0.5">Step {formStep} of 3</p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-1.5 rounded-full transition-colors ${formStep >= step ? "bg-indigo-600" : "bg-gray-200"}`}
              />
            ))}
            <DialogCloseButton onClose={() => { setShowModal(false); setFormStep(1); }} />
          </div>
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
            <div className="space-y-4">
              {formStep === 1 && (
                <>
                  <h3 className="font-semibold text-gray-700 text-sm">Student Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Full Name *" placeholder="Student's full name" />
                    <Input label="Date of Birth *" type="date" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                        <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                      </select>
                    </div>
                    <Input label="Phone Number" placeholder="Student's phone" />
                    <Input label="Email" type="email" placeholder="student@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                      placeholder="Full residential address"
                    />
                  </div>
                </>
              )}

              {formStep === 2 && (
                <>
                  <h3 className="font-semibold text-gray-700 text-sm">Academic & Parent Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Class *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {mockClasses.map(c => <option key={c._id} value={c._id}>Class {c.name}{c.section}</option>)}
                      </select>
                    </div>
                    <Input label="Admission Date *" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                    <Input label="Parent/Guardian Name *" placeholder="Parent full name" />
                    <Input label="Parent Phone *" placeholder="Parent phone number" />
                    <Input label="Parent Email" type="email" placeholder="parent@email.com" />
                    <Input label="Relation" placeholder="Father / Mother / Guardian" />
                  </div>
                </>
              )}

              {formStep === 3 && (
                <>
                  <h3 className="font-semibold text-gray-700 text-sm">Fee & Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Fee Category</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option>General</option>
                        <option>Scholarship 25%</option>
                        <option>Scholarship 50%</option>
                        <option>Staff Ward</option>
                      </select>
                    </div>
                    <Input label="Admission Fee" type="number" defaultValue="2000" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["Birth Certificate", "Transfer Certificate", "Aadhaar Card", "Photo (2 copies)", "Previous Mark Sheet", "Caste Certificate"].map((doc) => (
                      <label key={doc} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </label>
                    ))}
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

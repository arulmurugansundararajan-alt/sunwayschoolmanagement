"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Edit,
  X,
  CalendarDays,
  User,
  BookOpen,
  CheckCircle2,
  Plus,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FeeRecord {
  _id: string;
  studentName: string;
  className: string;
  section: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  receiptNumber?: string;
  remarks?: string;
  academicYear: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusColor: Record<string, string> = {
  Paid:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-100 text-amber-700 border-amber-200",
  Partial: "bg-blue-100 text-blue-700 border-blue-200",
  Overdue: "bg-red-100 text-red-700 border-red-200",
};

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffFeesPage() {
  const [fees, setFees]           = useState<FeeRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterClass, setFilterClass]   = useState("all");
  const [classes, setClasses]     = useState<string[]>([]);
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Edit dialog
  const [editTarget, setEditTarget] = useState<FeeRecord | null>(null);
  const [editForm, setEditForm]   = useState({ dueDate: "", remarks: "" });
  const [saving, setSaving]       = useState(false);
  const [saveError, setSaveError] = useState("");

  // Add fee dialog
  const [showAdd, setShowAdd]         = useState(false);
  const [addSaving, setAddSaving]     = useState(false);
  const [addError, setAddError]       = useState("");
  const [addSuccess, setAddSuccess]   = useState(false);
  const [studentQuery, setStudentQuery]         = useState("");
  const [studentResults, setStudentResults]     = useState<{ _id: string; name: string; studentId: string; className: string; section: string }[]>([]);
  const [studentSearching, setStudentSearching] = useState(false);
  const [showStudentDrop, setShowStudentDrop]   = useState(false);
  const thisYear = new Date().getFullYear();
  const [addForm2, setAddForm2] = useState({
    studentId: "", studentName: "", studentDisplay: "",
    feeType: "", amount: "", dueDate: "",
    academicYear: `${thisYear}-${thisYear + 1}`, remarks: "",
  });

  const fetchFees = useCallback(async (p = page) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(p), limit: "20" });
      if (search) params.set("search", search);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterClass !== "all") params.set("className", filterClass);

      const res  = await fetch(`/api/fees?${params}`);
      const json = await res.json();
      if (json.success) {
        setFees(json.data);
        setPagination(json.pagination);
        if (json.classes?.length) setClasses(json.classes);
      } else {
        setError(json.message || "Failed to load fees");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterClass, page]);

  useEffect(() => { fetchFees(page); }, [fetchFees, page]);

  function openEdit(fee: FeeRecord) {
    setEditTarget(fee);
    setEditForm({
      dueDate: fee.dueDate?.slice(0, 10) || "",
      remarks: fee.remarks || "",
    });
    setSaveError("");
  }

  async function saveEdit() {
    if (!editTarget) return;
    setSaving(true);
    setSaveError("");
    try {
      const res  = await fetch(`/api/fees/${editTarget._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: editForm.dueDate, remarks: editForm.remarks }),
      });
      const json = await res.json();
      if (json.success) {
        setEditTarget(null);
        fetchFees(page);
      } else {
        setSaveError(json.message || "Failed to save");
      }
    } catch {
      setSaveError("Network error");
    } finally {
      setSaving(false);
    }
  }

  // ── Student search for add fee ────────────────────────────────────────────
  useEffect(() => {
    if (studentQuery.length < 2) { setStudentResults([]); setShowStudentDrop(false); return; }
    const t = setTimeout(async () => {
      setStudentSearching(true);
      try {
        const res  = await fetch(`/api/students?search=${encodeURIComponent(studentQuery)}&limit=8`);
        const json = await res.json();
        setStudentResults(json.data || []);
        setShowStudentDrop(true);
      } catch { setStudentResults([]); }
      finally { setStudentSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [studentQuery]);

  function openAdd() {
    setShowAdd(true); setAddError(""); setAddSuccess(false);
    setStudentQuery(""); setStudentResults([]); setShowStudentDrop(false);
    setAddForm2({
      studentId: "", studentName: "", studentDisplay: "",
      feeType: "", amount: "", dueDate: "",
      academicYear: `${thisYear}-${thisYear + 1}`, remarks: "",
    });
  }

  async function submitAddFee() {
    const { studentId, feeType, amount, dueDate, academicYear } = addForm2;
    if (!studentId)      { setAddError("Please select a student"); return; }
    if (!feeType.trim()) { setAddError("Fee type is required"); return; }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { setAddError("Enter a valid amount"); return; }
    if (!dueDate)        { setAddError("Due date is required"); return; }

    setAddSaving(true); setAddError("");
    try {
      const res  = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, feeType, amount: Number(amount), dueDate, academicYear, remarks: addForm2.remarks }),
      });
      const json = await res.json();
      if (json.success) { setAddSuccess(true); fetchFees(page); }
      else setAddError(json.message || "Failed to create fee record");
    } catch { setAddError("Network error"); }
    finally { setAddSaving(false); }
  }

  const hasFilters = search || filterStatus !== "all" || filterClass !== "all";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-indigo-600" />
            Fee Records
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">View, update and add student fee records</p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={openAdd}>
          <Plus className="w-4 h-4" />
          Add Fee Record
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search student name..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="all">All Status</option>
                {["Paid", "Pending", "Partial", "Overdue"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Class</label>
              <select
                value={filterClass}
                onChange={(e) => { setFilterClass(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="all">All Classes</option>
                {classes.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterStatus("all"); setFilterClass("all"); setPage(1); }} className="text-gray-500">
                <X className="w-4 h-4 mr-1" />Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-red-500 gap-2">
              <AlertCircle className="w-8 h-8" /><p className="text-sm">{error}</p>
            </div>
          ) : fees.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
              <DollarSign className="w-10 h-10" /><p className="text-sm font-medium">No fee records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Class</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Fee Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Due Date</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fees.map((fee) => (
                    <tr key={fee._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-gray-800">{fee.studentName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                          {fee.className} – {fee.section}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{fee.feeType}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{formatCurrency(fee.amount)}</div>
                        {fee.paidAmount > 0 && (
                          <div className="text-xs text-emerald-600">Paid: {formatCurrency(fee.paidAmount)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[fee.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          {formatDate(fee.dueDate)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {fee.status !== "Paid" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                            onClick={() => openEdit(fee)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {page} of {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-7 w-7 p-0">
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="h-7 w-7 p-0">
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onClose={() => setEditTarget(null)} maxWidth="sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Update Fee Record
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            {saveError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4" />{saveError}
              </div>
            )}
            {editTarget && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <p className="font-medium text-gray-800">{editTarget.studentName}</p>
                <p className="text-gray-500">{editTarget.feeType} • {formatCurrency(editTarget.amount)} • {editTarget.status}</p>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Remarks</label>
              <textarea
                rows={3}
                value={editForm.remarks}
                onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
                placeholder="Add notes or reason for change..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
          <Button onClick={saveEdit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Changes
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add Fee Record Dialog */}
      <Dialog open={showAdd} onClose={() => setShowAdd(false)} maxWidth="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Fee Record</DialogTitle>
          </DialogHeader>

          {addSuccess ? (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              <p className="font-semibold text-gray-800">Fee record created successfully!</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => setShowAdd(false)}>Close</Button>
                <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">Add Another</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Student Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search student name or ID..."
                    value={addForm2.studentDisplay || studentQuery}
                    onChange={(e) => {
                      setStudentQuery(e.target.value);
                      setAddForm2(f => ({ ...f, studentId: "", studentName: "", studentDisplay: "" }));
                    }}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                  {studentSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-gray-400" />}
                  {addForm2.studentId && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                </div>
                {showStudentDrop && studentResults.length > 0 && (
                  <div className="border border-gray-200 rounded-lg mt-1 bg-white shadow-lg z-50 max-h-40 overflow-y-auto">
                    {studentResults.map(s => (
                      <button
                        key={s._id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 flex items-center gap-2 border-b border-gray-50 last:border-0"
                        onClick={() => {
                          setAddForm2(f => ({ ...f, studentId: s._id, studentName: s.name, studentDisplay: `${s.name} (${s.studentId}) — Class ${s.className}` }));
                          setStudentQuery("");
                          setShowStudentDrop(false);
                        }}
                      >
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span><span className="font-medium">{s.name}</span> <span className="text-gray-400">{s.studentId} · Class {s.className}</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fee Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type *</label>
                <input
                  type="text"
                  placeholder="e.g. Tuition Fee, Transport Fee..."
                  value={addForm2.feeType}
                  onChange={e => setAddForm2(f => ({ ...f, feeType: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* Amount + Academic Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={addForm2.amount}
                    onChange={e => setAddForm2(f => ({ ...f, amount: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <input
                    type="text"
                    value={addForm2.academicYear}
                    onChange={e => setAddForm2(f => ({ ...f, academicYear: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={addForm2.dueDate}
                  onChange={e => setAddForm2(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <input
                  type="text"
                  placeholder="Optional note..."
                  value={addForm2.remarks}
                  onChange={e => setAddForm2(f => ({ ...f, remarks: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>

              {addError && (
                <p className="flex items-center gap-1.5 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />{addError}
                </p>
              )}
            </div>
          )}

          {!addSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={submitAddFee} disabled={addSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {addSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Create Fee Record
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

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
  Receipt,
  Plus,
  Edit,
  Trash2,
  Loader2,
  TrendingUp,
  Calendar,
  IndianRupee,
  Search,
  ChevronLeft,
  ChevronRight,
  Tag,
  Filter,
  X,
  AlertCircle,
  Wallet,
  BarChart2,
  Settings2,
} from "lucide-react";
import BarChartComponent from "@/components/charts/BarChartComponent";
import PieChartComponent from "@/components/charts/PieChartComponent";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Expense {
  _id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  paymentMode: string;
  description: string;
  vendor: string;
  receiptNumber: string;
  createdByName: string;
  createdAt: string;
}

interface ExpenseCategory {
  _id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

interface Summary {
  monthTotal: number;
  yearTotal: number;
  todayTotal: number;
  categoryBreakdown: { _id: string; total: number; count: number }[];
  monthlyTrend: { _id: { year: number; month: number }; total: number; count: number }[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_MODES = ["Cash", "Bank Transfer", "UPI", "Cheque", "Card"] as const;

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const emptyForm = {
  title: "",
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  category: "",
  paymentMode: "Cash" as string,
  description: "",
  vendor: "",
  receiptNumber: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

const paymentColors: Record<string, string> = {
  Cash: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Bank Transfer": "bg-blue-100 text-blue-700 border-blue-200",
  UPI: "bg-purple-100 text-purple-700 border-purple-200",
  Cheque: "bg-amber-100 text-amber-700 border-amber-200",
  Card: "bg-rose-100 text-rose-700 border-rose-200",
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminExpensesPage() {
  const [expenses, setExpenses]       = useState<Expense[]>([]);
  const [categories, setCategories]   = useState<ExpenseCategory[]>([]);
  const [summary, setSummary]         = useState<Summary | null>(null);
  const [pagination, setPagination]   = useState<Pagination>({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");

  // Filters
  const [search, setSearch]           = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPayment, setFilterPayment]   = useState("all");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [page, setPage]               = useState(1);

  // Modals
  const [formOpen, setFormOpen]           = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<Expense | null>(null);
  const [deleting, setDeleting]           = useState(false);
  const [catOpen, setCatOpen]             = useState(false);

  // Expense form
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState("");

  // Category form
  const [catForm, setCatForm]       = useState({ name: "", color: "#6366f1" });
  const [catSaving, setCatSaving]   = useState(false);
  const [catError, setCatError]     = useState("");
  const [catDeleting, setCatDeleting] = useState<string | null>(null);

  // ── Fetch categories ────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    const res = await fetch("/api/expense-categories");
    if (res.ok) {
      const json = await res.json();
      if (json.success) setCategories(json.data);
    }
  }, []);

  // ── Fetch expenses ──────────────────────────────────────────────────────────
  const fetchExpenses = useCallback(async (newPage = page) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(newPage), limit: "20" });
      if (search)         params.set("search", search);
      if (filterCategory !== "all") params.set("category", filterCategory);
      if (filterPayment !== "all")  params.set("paymentMode", filterPayment);
      if (dateFrom)       params.set("dateFrom", dateFrom);
      if (dateTo)         params.set("dateTo", dateTo);

      const res = await fetch(`/api/expenses?${params}`);
      const json = await res.json();
      if (json.success) {
        setExpenses(json.data);
        setSummary(json.summary);
        setPagination(json.pagination);
      } else {
        setError(json.message || "Failed to load expenses");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory, filterPayment, dateFrom, dateTo, page]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchExpenses(page); }, [fetchExpenses, page]);

  // ── Open add / edit form ────────────────────────────────────────────────────
  function openAdd() {
    setEditingExpense(null);
    setForm({ ...emptyForm });
    setFormError("");
    setFormOpen(true);
  }

  function openEdit(e: Expense) {
    setEditingExpense(e);
    setForm({
      title: e.title,
      amount: String(e.amount),
      date: e.date.slice(0, 10),
      category: e.category,
      paymentMode: e.paymentMode,
      description: e.description || "",
      vendor: e.vendor || "",
      receiptNumber: e.receiptNumber || "",
    });
    setFormError("");
    setFormOpen(true);
  }

  // ── Save expense ────────────────────────────────────────────────────────────
  async function saveExpense() {
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0) {
      setFormError("Enter a valid amount"); return;
    }
    if (!form.date) { setFormError("Date is required"); return; }
    if (!form.category) { setFormError("Select a category"); return; }
    if (!form.paymentMode) { setFormError("Select payment mode"); return; }

    setSaving(true);
    setFormError("");
    try {
      const url    = editingExpense ? `/api/expenses/${editingExpense._id}` : "/api/expenses";
      const method = editingExpense ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      const json = await res.json();
      if (json.success) {
        setFormOpen(false);
        setPage(1);
        fetchExpenses(1);
      } else {
        setFormError(json.message || "Failed to save");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete expense ───────────────────────────────────────────────────────────
  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteTarget._id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeleteTarget(null);
        fetchExpenses(page);
      }
    } catch {
      /* noop */
    } finally {
      setDeleting(false);
    }
  }

  // ── Category CRUD ────────────────────────────────────────────────────────────
  async function addCategory() {
    if (!catForm.name.trim()) { setCatError("Name is required"); return; }
    setCatSaving(true);
    setCatError("");
    try {
      const res  = await fetch("/api/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(catForm),
      });
      const json = await res.json();
      if (json.success) {
        setCatForm({ name: "", color: "#6366f1" });
        fetchCategories();
      } else {
        setCatError(json.message || "Failed to add");
      }
    } catch {
      setCatError("Network error");
    } finally {
      setCatSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    setCatDeleting(id);
    try {
      await fetch(`/api/expense-categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch { /* noop */ } finally {
      setCatDeleting(null);
    }
  }

  // ── Chart data ───────────────────────────────────────────────────────────────
  const barData = (summary?.monthlyTrend || []).map((m) => ({
    name: `${MONTH_NAMES[m._id.month - 1]} ${m._id.year}`,
    value: m.total,
  }));

  const pieData = (summary?.categoryBreakdown || []).map((c) => ({
    name: c._id,
    value: c.total,
  }));

  const catColorMap: Record<string, string> = {};
  categories.forEach((c) => { catColorMap[c.name] = c.color; });

  function clearFilters() {
    setSearch(""); setFilterCategory("all"); setFilterPayment("all");
    setDateFrom(""); setDateTo(""); setPage(1);
  }

  const hasActiveFilters = search || filterCategory !== "all" || filterPayment !== "all" || dateFrom || dateTo;

  // ── UI ────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600" />
            Expense Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage school expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCatOpen(true)}>
            <Settings2 className="w-4 h-4 mr-1.5" />
            Categories
          </Button>
          <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="This Month"
          value={formatCurrency(summary?.monthTotal || 0)}
          icon={<IndianRupee className="w-5 h-5" />}
          color="indigo"
        />
        <StatCard
          label="This Year"
          value={formatCurrency(summary?.yearTotal || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Today"
          value={formatCurrency(summary?.todayTotal || 0)}
          icon={<Calendar className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label="Total Records"
          value={String(pagination.total)}
          icon={<Receipt className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Charts */}
      {(barData.length > 0 || pieData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {barData.length > 0 && (
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-indigo-500" />
                  Monthly Expense Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent
                  data={barData}
                  bars={[{ key: "value", color: "#6366f1", name: "Amount (₹)" }]}
                  xKey="name"
                  height={220}
                  showLegend={false}
                />
              </CardContent>
            </Card>
          )}
          {pieData.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  By Category (This Month)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={pieData} height={220} showLegend innerRadius={55} outerRadius={85} />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search title, vendor, receipt…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Date from */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Payment mode */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Payment</label>
              <select
                value={filterPayment}
                onChange={(e) => { setFilterPayment(e.target.value); setPage(1); }}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
              >
                <option value="all">All Modes</option>
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-500 hover:text-gray-700">
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
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-16 text-red-500 gap-2">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={() => fetchExpenses(page)}>Retry</Button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400 gap-2">
              <Wallet className="w-10 h-10" />
              <p className="text-sm font-medium">No expenses found</p>
              {hasActiveFilters && (
                <p className="text-xs">Try clearing the filters</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Mode</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses.map((exp) => (
                    <tr key={exp._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{exp.title}</div>
                        {exp.receiptNumber && (
                          <div className="text-xs text-gray-400">#{exp.receiptNumber}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: (catColorMap[exp.category] || "#6366f1") + "20",
                            color: catColorMap[exp.category] || "#6366f1",
                            borderColor: (catColorMap[exp.category] || "#6366f1") + "40",
                          }}
                        >
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${paymentColors[exp.paymentMode] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {exp.paymentMode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{exp.vendor || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                            onClick={() => openEdit(exp)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                            onClick={() => setDeleteTarget(exp)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 border-t border-gray-100">
                    <td colSpan={5} className="px-4 py-2 text-xs text-gray-500">
                      Showing {expenses.length} of {pagination.total} records
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-gray-800 text-sm">
                      {formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Add / Edit Expense Dialog ─────────────────────────────────────────── */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="lg">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExpense ? "Edit Expense" : "Add Expense"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            {/* Title */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Electricity bill for January"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Amount + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Amount (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Category + Payment Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Payment Mode <span className="text-red-500">*</span></label>
                <select
                  value={form.paymentMode}
                  onChange={(e) => setForm({ ...form, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  {PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vendor + Receipt */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Vendor / Payee</label>
                <input
                  type="text"
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  placeholder="e.g. TNEB"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Receipt No.</label>
                <input
                  type="text"
                  value={form.receiptNumber}
                  onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                  placeholder="e.g. RCT-001"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional notes (optional)"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={saveExpense} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingExpense ? "Save Changes" : "Add Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="sm">
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Expense
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Delete <strong>{deleteTarget?.title}</strong> ({formatCurrency(deleteTarget?.amount || 0)})?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Category Management Dialog ────────────────────────────────────────── */}
      <Dialog open={catOpen} onClose={() => setCatOpen(false)} maxWidth="md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-600" />
              Manage Categories
            </DialogTitle>
          </DialogHeader>

          {/* Add custom category */}
          <div className="border border-dashed border-indigo-200 rounded-lg p-3 bg-indigo-50/30 space-y-2">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Add New Category</p>
            {catError && (
              <p className="text-xs text-red-600">{catError}</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Category name"
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <input
                type="color"
                value={catForm.color}
                onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
                className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer"
                title="Pick color"
              />
              <Button
                size="sm"
                onClick={addCategory}
                disabled={catSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {catSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>

          {/* Category list */}
          <div className="space-y-1.5 mt-2">
            {categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm text-gray-800">{c.name}</span>
                  {c.isDefault && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">default</span>
                  )}
                </div>
                {!c.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                    disabled={catDeleting === c._id}
                    onClick={() => deleteCategory(c._id)}
                  >
                    {catDeleting === c._id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />
                    }
                  </Button>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCatOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Stat Card Component ──────────────────────────────────────────────────────

function StatCard({
  label, value, icon, color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "indigo" | "blue" | "emerald" | "amber";
}) {
  const colorMap = {
    indigo: { bg: "bg-indigo-50",  text: "text-indigo-600",  icon: "bg-indigo-100" },
    blue:   { bg: "bg-blue-50",    text: "text-blue-600",    icon: "bg-blue-100" },
    emerald:{ bg: "bg-emerald-50", text: "text-emerald-600", icon: "bg-emerald-100" },
    amber:  { bg: "bg-amber-50",   text: "text-amber-600",   icon: "bg-amber-100" },
  };
  const c = colorMap[color];

  return (
    <Card className={`border-0 shadow-sm ${c.bg}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${c.icon} ${c.text}`}>{icon}</div>
          <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-lg font-bold ${c.text}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

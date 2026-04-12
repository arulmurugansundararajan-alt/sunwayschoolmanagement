"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter, DialogCloseButton
} from "@/components/ui/dialog";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import PieChartComponent from "@/components/charts/PieChartComponent";
import { mockStudents, feeCollectionData, feeTypeBreakdownData } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign, Search, CheckCircle, AlertTriangle, Clock, TrendingUp, Plus, Download, Filter
} from "lucide-react";

export default function FeeManagementPage() {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<(typeof mockStudents[0]["fees"][0] & { studentName: string }) | null>(null);

  const allFeeRecords = mockStudents.flatMap((s) =>
    s.fees.map((f) => ({ ...f, studentName: s.name, studentId: s.studentId, className: s.className }))
  );

  const filtered = allFeeRecords.filter((f) => {
    const matchSearch = f.studentName.toLowerCase().includes(search.toLowerCase()) ||
      f.studentId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !selectedStatus || f.status === selectedStatus;
    return matchSearch && matchStatus;
  });

  const totalCollected = allFeeRecords.filter(f => f.status === "Paid").reduce((sum, f) => sum + f.amount, 0);
  const totalPending = allFeeRecords.filter(f => f.status !== "Paid").reduce((sum, f) => sum + (f.amount - f.paidAmount), 0);
  const paidCount = allFeeRecords.filter(f => f.status === "Paid").length;
  const overdueCount = allFeeRecords.filter(f => f.status === "Overdue").length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: formatCurrency(totalCollected), icon: CheckCircle, color: "from-emerald-500 to-teal-600", sub: `${paidCount} payments` },
          { label: "Total Pending", value: formatCurrency(totalPending), icon: AlertTriangle, color: "from-amber-500 to-orange-600", sub: `${allFeeRecords.filter(f => f.status === "Pending").length} pending` },
          { label: "Overdue", value: overdueCount, icon: Clock, color: "from-red-500 to-rose-700", sub: "Requires attention" },
          { label: "Collection Rate", value: `${Math.round((totalCollected / (totalCollected + totalPending)) * 100)}%`, icon: TrendingUp, color: "from-indigo-500 to-purple-700", sub: "This academic year" },
        ].map((stat) => (
          <Card key={stat.label} className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-lg`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-white/70" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-white/70 text-sm mt-0.5">{stat.label}</p>
              <p className="text-white/50 text-xs">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fee Collection Trend</CardTitle>
            <CardDescription>Monthly collected vs pending amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChartComponent
              data={feeCollectionData}
              areas={[
                { key: "collected", color: "#10B981", name: "Collected (₹)" },
                { key: "pending", color: "#F59E0B", name: "Pending (₹)" },
              ]}
              height={220}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent
              data={[
                { name: "Paid", value: paidCount, fill: "#10B981" },
                { name: "Pending", value: allFeeRecords.filter(f => f.status === "Pending").length, fill: "#F59E0B" },
                { name: "Partial", value: allFeeRecords.filter(f => f.status === "Partial").length, fill: "#3B82F6" },
                { name: "Overdue", value: overdueCount, fill: "#EF4444" },
              ]}
              height={220}
              innerRadius={55}
              outerRadius={85}
            />
          </CardContent>
        </Card>
      </div>

      {/* Fee Records */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search student name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="flex-1"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Overdue">Overdue</option>
            </select>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" /> Add Record
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
          <p className="text-xs text-gray-500">{filtered.length} records</p>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 15).map((fee, i) => (
              <TableRow key={`${fee._id}-${i}`}>
                <TableCell>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{fee.studentName}</p>
                    <p className="text-xs text-gray-500">{fee.studentId} • {fee.className}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-700">{fee.feeType}</TableCell>
                <TableCell className="text-sm font-semibold text-gray-900">{formatCurrency(fee.amount)}</TableCell>
                <TableCell>
                  <span className={`text-sm font-semibold ${fee.paidAmount >= fee.amount ? "text-emerald-600" : "text-amber-600"}`}>
                    {formatCurrency(fee.paidAmount)}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-gray-600">{formatDate(fee.dueDate)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      fee.status === "Paid" ? "success" :
                      fee.status === "Pending" ? "warning" :
                      fee.status === "Partial" ? "info" : "destructive"
                    }
                  >
                    {fee.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {fee.status !== "Paid" && (
                    <Button
                      size="sm"
                      variant="success"
                      className="text-xs h-7 px-3"
                      onClick={() => {
                        setSelectedFee(fee as typeof selectedFee);
                        setShowPayModal(true);
                      }}
                    >
                      Collect
                    </Button>
                  )}
                  {fee.status === "Paid" && fee.receiptNumber && (
                    <span className="text-xs text-gray-500">{fee.receiptNumber}</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Payment Modal */}
      <Dialog open={showPayModal} onClose={() => setShowPayModal(false)}>
        <DialogHeader>
          <DialogTitle>Collect Fee Payment</DialogTitle>
          <DialogCloseButton onClose={() => setShowPayModal(false)} />
        </DialogHeader>
        <DialogContent>
          {selectedFee && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-700">{selectedFee.studentName}</p>
                <p className="text-xs text-amber-600">{selectedFee.feeType} — {formatCurrency(selectedFee.amount)}</p>
              </div>
              <Input label="Amount Received" type="number" defaultValue={selectedFee.amount - selectedFee.paidAmount} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>Online Transfer</option>
                  <option>Cash</option>
                  <option>DD/Cheque</option>
                  <option>UPI</option>
                </select>
              </div>
              <Input label="Remarks (Optional)" placeholder="Any notes about this payment" />
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowPayModal(false)}>Cancel</Button>
          <Button variant="success" onClick={() => setShowPayModal(false)}>
            <CheckCircle className="w-4 h-4" /> Confirm Payment
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import FeeModel from "@/models/Fee";
import { getStaffRole } from "@/lib/staffAccess";

async function checkFeeAccess() {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, isAccountant: false };
  const role = (session.user as { role?: string }).role;
  if (role === "admin") return { ok: true, isAccountant: false };
  if (role === "staff") {
    const staffRole = await getStaffRole();
    if (staffRole === "accountant") return { ok: true, isAccountant: true };
  }
  return { ok: false, isAccountant: false };
}

// GET /api/fees/[id]
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { ok } = await checkFeeAccess();
    if (!ok) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    await connectDB();
    const fee = await FeeModel.findById(id).lean();
    if (!fee) return NextResponse.json({ success: false, message: "Fee not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    console.error("GET /api/fees/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/fees/[id] — update fee or record a payment
// Admin: full update + fee collection
// Accountant: can update status/remarks only — CANNOT collect fees
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { ok, isAccountant } = await checkFeeAccess();
    if (!ok) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const body = await request.json();
    const fee = await FeeModel.findById(id);
    if (!fee) return NextResponse.json({ success: false, message: "Fee not found" }, { status: 404 });

    // Payment collection — admin only
    if (body.collectPayment) {
      if (isAccountant) {
        return NextResponse.json({ success: false, message: "Accountants cannot collect fees" }, { status: 403 });
      }
      const { paidAmount, paymentMethod, paidDate, remarks } = body;
      const newPaid = (fee.paidAmount || 0) + Number(paidAmount);
      fee.paidAmount = newPaid;
      fee.paymentMethod = paymentMethod;
      fee.paidDate = paidDate ? new Date(paidDate) : new Date();
      if (remarks) fee.remarks = remarks;

      if (newPaid >= fee.amount) {
        fee.status = "Paid";
        if (!fee.receiptNumber) {
          const year = new Date().getFullYear();
          const count = await FeeModel.countDocuments({ receiptNumber: { $exists: true, $ne: null } });
          fee.receiptNumber = `RCP-${year}-${String(count + 1).padStart(5, "0")}`;
        }
      } else if (newPaid > 0) {
        fee.status = "Partial";
      }
      await fee.save();
      return NextResponse.json({ success: true, data: fee });
    }

    // General update
    // Accountant can only update: dueDate, remarks (no amount/feeType changes)
    const allowedAdmin = ["feeType", "amount", "dueDate", "academicYear", "remarks"];
    const allowedAccountant = ["dueDate", "remarks"];
    const allowed = isAccountant ? allowedAccountant : allowedAdmin;

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === "dueDate") {
          (fee as Record<string, unknown>)[key] = new Date(body[key] as string);
        } else {
          (fee as Record<string, unknown>)[key] = body[key];
        }
      }
    }

    const now = new Date();
    if (fee.paidAmount >= fee.amount) {
      fee.status = "Paid";
    } else if (fee.paidAmount > 0) {
      fee.status = "Partial";
    } else if (fee.dueDate < now) {
      fee.status = "Overdue";
    } else {
      fee.status = "Pending";
    }

    await fee.save();
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    console.error("PUT /api/fees/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/fees/[id] — admin only
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    await connectDB();
    await FeeModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/fees/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

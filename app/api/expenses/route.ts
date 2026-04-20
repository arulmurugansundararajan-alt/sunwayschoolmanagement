import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import ExpenseModel from "@/models/Expense";
import { getStaffRole } from "@/lib/staffAccess";

async function checkExpenseAccess() {
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, session: null };
  const role = (session.user as { role?: string }).role;
  if (role === "admin") return { ok: true, session };
  if (role === "staff") {
    const staffRole = await getStaffRole();
    if (staffRole === "accountant") return { ok: true, session };
  }
  return { ok: false, session: null };
}

// GET /api/expenses — list with filters (admin + accountant)
export async function GET(req: NextRequest) {
  try {
    const { ok } = await checkExpenseAccess();
    if (!ok) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const { searchParams } = new URL(req.url);
    const dateFrom   = searchParams.get("dateFrom");
    const dateTo     = searchParams.get("dateTo");
    const category   = searchParams.get("category");
    const paymentMode = searchParams.get("paymentMode");
    const search     = searchParams.get("search");
    const page       = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit      = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));

    const filter: Record<string, unknown> = { isActive: true };

    if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
      filter.date = dateFilter;
    }

    if (category && category !== "all") filter.category = category;
    if (paymentMode && paymentMode !== "all") filter.paymentMode = paymentMode;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { vendor: { $regex: search, $options: "i" } },
        { receiptNumber: { $regex: search, $options: "i" } },
      ];
    }

    const total = await ExpenseModel.countDocuments(filter);
    const expenses = await ExpenseModel.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Summary stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart  = new Date(now.getFullYear(), 0, 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [monthTotal, yearTotal, todayTotal] = await Promise.all([
      ExpenseModel.aggregate([
        { $match: { isActive: true, date: { $gte: monthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      ExpenseModel.aggregate([
        { $match: { isActive: true, date: { $gte: yearStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      ExpenseModel.aggregate([
        { $match: { isActive: true, date: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    // Category breakdown for current month
    const categoryBreakdown = await ExpenseModel.aggregate([
      { $match: { isActive: true, date: { $gte: monthStart } } },
      { $group: { _id: "$category", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyTrend = await ExpenseModel.aggregate([
      { $match: { isActive: true, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: expenses.map((e) => ({
        _id: String(e._id),
        title: e.title,
        amount: e.amount,
        date: e.date,
        category: e.category,
        paymentMode: e.paymentMode,
        description: e.description || "",
        vendor: e.vendor || "",
        receiptNumber: e.receiptNumber || "",
        createdBy: e.createdBy,
        createdByName: e.createdByName,
        isActive: e.isActive,
        createdAt: e.createdAt,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      summary: {
        monthTotal: monthTotal[0]?.total || 0,
        yearTotal: yearTotal[0]?.total || 0,
        todayTotal: todayTotal[0]?.total || 0,
        categoryBreakdown,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("GET /api/expenses error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/expenses — create expense (admin + accountant)
export async function POST(req: NextRequest) {
  try {
    const { ok, session } = await checkExpenseAccess();
    if (!ok || !session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const { title, amount, date, category, paymentMode, description, vendor, receiptNumber } = body;

    if (!title?.trim()) return NextResponse.json({ success: false, message: "Title is required" }, { status: 400 });
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) {
      return NextResponse.json({ success: false, message: "A valid amount is required" }, { status: 400 });
    }
    if (!date) return NextResponse.json({ success: false, message: "Date is required" }, { status: 400 });
    if (!category?.trim()) return NextResponse.json({ success: false, message: "Category is required" }, { status: 400 });
    if (!paymentMode) return NextResponse.json({ success: false, message: "Payment mode is required" }, { status: 400 });

    const user = session.user as { name?: string; email?: string };
    const expense = await ExpenseModel.create({
      title: title.trim(),
      amount: Number(amount),
      date: new Date(date),
      category: category.trim(),
      paymentMode,
      description: description?.trim() || undefined,
      vendor: vendor?.trim() || undefined,
      receiptNumber: receiptNumber?.trim() || undefined,
      createdBy: user.email || "admin",
      createdByName: user.name || "Admin",
    });

    return NextResponse.json(
      { success: true, data: { _id: expense._id.toString(), ...expense.toObject() }, message: "Expense added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/expenses error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

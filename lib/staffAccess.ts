import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import StaffModel from "@/models/Staff";

export type StaffRole =
  | "teacher"
  | "accountant"
  | "admin_staff"
  | "librarian"
  | "counselor"
  | "coordinator";

/**
 * Fetches the staffRole of the currently logged-in staff member.
 * First checks the JWT session (staffRole stored at login), then falls back to DB lookup.
 * Returns null if not a staff session or no staff record found.
 */
export async function getStaffRole(): Promise<StaffRole | null> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "staff") return null;

  // If staffRole was stored in JWT at login, use it
  const jwtStaffRole = (session.user as { staffRole?: string }).staffRole;
  if (jwtStaffRole) return jwtStaffRole as StaffRole;

  // Fallback: DB lookup (for accounts created before staffRole was in User model)
  await connectDB();
  const userId = (session.user as { id?: string }).id;
  const staff = await StaffModel.findOne({ userId, isActive: true })
    .select("staffRole")
    .lean();
  if (!staff) return null;
  return ((staff as { staffRole?: string }).staffRole as StaffRole) || "teacher";
}

/** Permission check helpers */
export const can = {
  viewFees: (role: StaffRole) => role === "accountant",
  updateFeeStatus: (role: StaffRole) => role === "accountant",
  collectFees: () => false,              // staff can NEVER collect fees — admin only
  viewExpenses: (role: StaffRole) => role === "accountant",
  createExpense: (role: StaffRole) => role === "accountant",
  updateExpense: (role: StaffRole) => role === "accountant",
  viewFinancialReports: () => false,     // staff can NEVER view financial reports
  manageClasses: (role: StaffRole) => role === "teacher",
  markAttendance: (role: StaffRole) => role === "teacher",
  manageAssignments: (role: StaffRole) => role === "teacher",
  enterMarks: (role: StaffRole) => role === "teacher",
};

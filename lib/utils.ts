import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Grade } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateGrade(percentage: number): Grade {
  if (percentage >= 91) return "A+";
  if (percentage >= 81) return "A";
  if (percentage >= 71) return "B+";
  if (percentage >= 61) return "B";
  if (percentage >= 51) return "C+";
  if (percentage >= 41) return "C";
  if (percentage >= 35) return "D";
  return "F";
}

export function getGradeColor(grade: Grade): string {
  const colors: Record<Grade, string> = {
    "A+": "text-emerald-600 bg-emerald-50",
    "A": "text-green-600 bg-green-50",
    "B+": "text-blue-600 bg-blue-50",
    "B": "text-indigo-600 bg-indigo-50",
    "C+": "text-yellow-600 bg-yellow-50",
    "C": "text-orange-600 bg-orange-50",
    "D": "text-red-400 bg-red-50",
    "F": "text-red-700 bg-red-100",
  };
  return colors[grade] || "text-gray-600 bg-gray-50";
}

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 90) return "text-emerald-600";
  if (percentage >= 75) return "text-blue-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getFeeStatusColor(status: string): string {
  const colors: Record<string, string> = {
    Paid: "text-emerald-700 bg-emerald-50 border-emerald-200",
    Pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
    Partial: "text-blue-700 bg-blue-50 border-blue-200",
    Overdue: "text-red-700 bg-red-50 border-red-200",
  };
  return colors[status] || "text-gray-700 bg-gray-50";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateFull(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function generateStudentId(index: number): string {
  return `PA${new Date().getFullYear()}${String(index).padStart(4, "0")}`;
}

export function generateStaffId(index: number): string {
  return `ST${new Date().getFullYear()}${String(index).padStart(3, "0")}`;
}

export function generateReceiptNumber(): string {
  return `RCP${Date.now()}`;
}

export function calculateAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDayName(dayIndex: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[dayIndex];
}

export function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 6) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export function getSubjectColor(subject: string): string {
  const colors: Record<string, string> = {
    Tamil: "bg-orange-100 text-orange-800 border-orange-200",
    English: "bg-blue-100 text-blue-800 border-blue-200",
    Mathematics: "bg-purple-100 text-purple-800 border-purple-200",
    Maths: "bg-purple-100 text-purple-800 border-purple-200",
    Science: "bg-green-100 text-green-800 border-green-200",
    Physics: "bg-cyan-100 text-cyan-800 border-cyan-200",
    Chemistry: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Biology: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Social Science": "bg-red-100 text-red-800 border-red-200",
    History: "bg-amber-100 text-amber-800 border-amber-200",
    "Computer Science": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Physical Education": "bg-pink-100 text-pink-800 border-pink-200",
  };
  return colors[subject] || "bg-gray-100 text-gray-800 border-gray-200";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return function (...args: Parameters<T>) {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

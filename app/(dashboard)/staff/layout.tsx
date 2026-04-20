"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/shared/ChatWidget";
import { NotificationProvider } from "@/components/providers/NotificationContext";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/staff": { title: "Staff Dashboard", subtitle: "Welcome to your portal" },
  "/staff/classes": { title: "My Classes", subtitle: "Classes assigned to you" },
  "/staff/attendance": { title: "Attendance", subtitle: "Mark and manage attendance" },
  "/staff/marks": { title: "Marks Entry", subtitle: "Enter and manage student marks" },
  "/staff/assignments": { title: "Assignments", subtitle: "Create and manage homework" },
  "/staff/communication": { title: "Communication", subtitle: "Messages and notifications" },
  "/staff/calendar": { title: "School Calendar", subtitle: "Events and holidays" },
  "/staff/fees": { title: "Fee Management", subtitle: "View and update fee records" },
  "/staff/expenses": { title: "Expenses", subtitle: "Manage school expenses" },
  "/staff/announcements": { title: "Announcements", subtitle: "School announcements" },
};

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staffRole, setStaffRole] = useState<string>("teacher");
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const pageInfo = pageTitles[pathname] || { title: "Staff Portal", subtitle: "Sunway Global School" };

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/staff/me", { cache: "no-store" })
        .then((r) => r.json())
        .then((json) => {
          if (json.success && json.data?.profile?.staffRole) {
            setStaffRole(json.data.profile.staffRole);
          }
        })
        .catch(() => {});
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session || (session.user as { role?: string })?.role !== "staff") {
    redirect("/login");
  }

  return (
    <NotificationProvider>
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar role="staff" staffRole={staffRole} />
      </div>
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
            <Sidebar role="staff" staffRole={staffRole} />
          </div>
        </>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 animate-fade-in-up">{children}</div>
        </main>
      </div>
      <ChatWidget />
    </div>
    </NotificationProvider>
  );
}

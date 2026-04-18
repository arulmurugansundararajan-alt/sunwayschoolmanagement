"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Users, Bell, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetAudience: "staff" | "parent" | "both";
  createdByName: string;
  expiresAt?: string;
  createdAt: string;
}

const priorityBadge: Record<string, "secondary" | "info" | "warning" | "destructive"> = {
  low: "secondary", medium: "info", high: "warning", urgent: "destructive",
};
const priorityLabel: Record<string, string> = {
  low: "Low", medium: "Medium", high: "High", urgent: "Urgent",
};

export default function ParentAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/announcements", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setAnnouncements(json.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-600 to-violet-700 text-white border-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
        <CardContent className="p-6 relative z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
            <Megaphone className="w-5 h-5" /> School Announcements
          </h2>
          <p className="text-white/70 text-sm">Important notices from the school</p>
          <div className="mt-3 flex items-center gap-4">
            <div><p className="text-2xl font-bold">{announcements.length}</p><p className="text-white/60 text-xs">Total</p></div>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-red-300">{announcements.filter(a => a.priority === "urgent").length}</p>
              <p className="text-white/60 text-xs">Urgent</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
        </div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No announcements at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <Card key={a._id} className={`border-l-4 ${
              a.priority === "urgent" ? "border-l-red-500" :
              a.priority === "high"   ? "border-l-amber-500" :
              a.priority === "medium" ? "border-l-blue-500" : "border-l-gray-300"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Bell className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{a.title}</h3>
                      <Badge variant={priorityBadge[a.priority]} className="text-xs">{priorityLabel[a.priority]}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{a.content}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>By {a.createdByName}</span>
                      <span>•</span>
                      <span>{formatDate(a.createdAt)}</span>
                      {a.expiresAt && (
                        <><span>•</span><span className="text-amber-600">Expires {formatDate(a.expiresAt)}</span></>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

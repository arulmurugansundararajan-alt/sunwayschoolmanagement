import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import EventModel from "@/models/Event";
import AnnouncementModel, { IAnnouncement } from "@/models/Announcement";
import type { Types } from "mongoose";

export interface NotificationItem {
  _id: string;           // "event_<id>" | "ann_<id>"
  title: string;
  type: "event" | "announcement";
  date: string;          // ISO string — event startDate or announcement createdAt
  subLabel?: string;     // eventType or priority
}

// GET /api/notifications — returns upcoming events + recent announcements
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const in60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const role = (session.user as { role?: string }).role ?? "parent";

    // Audience filter for events
    const eventAudienceFilter =
      role === "admin"
        ? {}
        : { $or: [{ targetAudience: "all" }, { targetAudience: role }] };

    // Audience filter for announcements
    const annAudienceFilter =
      role === "admin"
        ? {}
        : role === "staff"
        ? { $or: [{ targetAudience: "staff" }, { targetAudience: "both" }] }
        : { $or: [{ targetAudience: "parent" }, { targetAudience: "both" }] };

    const [events, announcements] = await Promise.all([
      EventModel.find({
        isActive: true,
        startDate: { $gte: now, $lte: in60Days },
        ...eventAudienceFilter,
      })
        .sort({ startDate: 1 })
        .limit(25)
        .lean(),

      AnnouncementModel.find({
        isActive: true,
        createdAt: { $gte: past30Days },
        ...annAudienceFilter,
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean<(IAnnouncement & { _id: Types.ObjectId; createdAt: Date })[]>(),
    ]);

    const items: NotificationItem[] = [
      ...events.map((e) => ({
        _id: `event_${e._id}`,
        title: e.title as string,
        type: "event" as const,
        date: (e.startDate as Date).toISOString(),
        subLabel: e.eventType as string,
      })),
      ...announcements.map((a) => ({
        _id: `ann_${a._id.toString()}`,
        title: a.title,
        type: "announcement" as const,
        date: (a.createdAt as unknown as Date).toISOString(),
        subLabel: a.priority,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

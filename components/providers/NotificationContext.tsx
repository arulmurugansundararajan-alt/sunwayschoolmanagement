"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import type { NotificationItem } from "@/app/api/notifications/route";

/** Notification shape passed to addNotification (legacy compat) */
export interface LocalNotification {
  title: string;
  message?: string;
  type?: string;
  category?: string;
  targetRole?: string;
  createdBy?: string;
  [key: string]: unknown;
}

const LS_KEY = "sw_notif_read_ids";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? new Set<string>(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // ignore storage errors
  }
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  refresh: () => void;
  // ── Legacy compat stubs (won't persist) ──────────────────────────────────
  addNotification: (n: LocalNotification) => void;
  markCategoryRead: (category: string) => void;
  getUnreadCountByCategory: (category: string) => number;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialise readIds from localStorage after mount
  useEffect(() => {
    setReadIds(loadReadIds());
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) setItems(json.data as NotificationItem[]);
    } catch {
      // silently fail — non-critical
    }
  }, []);

  // Fetch on mount, then every 5 minutes
  useEffect(() => {
    fetchNotifications();
    timerRef.current = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchNotifications]);

  const markRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      items.forEach((n) => next.add(n._id));
      saveReadIds(next);
      return next;
    });
  }, [items]);

  const clearAll = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      items.forEach((n) => next.add(n._id));
      saveReadIds(next);
      return next;
    });
    setItems([]);
  }, [items]);

  const unreadCount = items.filter((n) => !readIds.has(n._id)).length;
  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  // ── Legacy compat stubs ──────────────────────────────────────────────────
  const addNotification = useCallback((n: LocalNotification) => {
    const item: NotificationItem = {
      _id: `local_${Date.now()}`,
      title: n.title,
      type: "announcement",
      date: new Date().toISOString(),
      subLabel: n.category,
    };
    setItems((prev) => [item, ...prev]);
  }, []);

  const markCategoryRead = useCallback((_category: string) => {
    // no-op: categories no longer exist in notification items
  }, []);

  const getUnreadCountByCategory = useCallback((_category: string) => 0, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications: items,
        unreadCount,
        isRead,
        markRead,
        markAllRead,
        clearAll,
        refresh: fetchNotifications,
        addNotification,
        markCategoryRead,
        getUnreadCountByCategory,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}


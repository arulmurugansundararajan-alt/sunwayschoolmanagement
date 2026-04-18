"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Notification } from "@/types";
import { mockNotifications } from "@/lib/mock-data";

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "_id" | "createdAt" | "isRead">) => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  markCategoryRead: (category: string) => void;
  getUnreadCountByCategory: (category: string) => number;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const addNotification = useCallback(
    (n: Omit<Notification, "_id" | "createdAt" | "isRead">) => {
      const newNotif: Notification = {
        ...n,
        _id: `notif_${Date.now()}`,
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const markCategoryRead = useCallback((category: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.category === category ? { ...n, isRead: true } : n))
    );
  }, []);

  const getUnreadCountByCategory = useCallback(
    (category: string) =>
      notifications.filter((n) => n.category === category && !n.isRead).length,
    [notifications]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAllRead, markRead, markCategoryRead, getUnreadCountByCategory }}
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

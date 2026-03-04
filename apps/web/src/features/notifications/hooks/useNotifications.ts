import { useState, useEffect, useCallback, useRef } from "react";
import { notificationApi, type Notification } from "../api/notification.api";
import { useAuth } from "../../../app/providers/AuthProvider";

const POLL_INTERVAL = 30_000; // 30 seconds

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]     = useState(0);
  const [loading,       setLoading]         = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const count = await notificationApi.getUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, [user]);

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await notificationApi.getAll({ limit: 20, unread: unreadOnly });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {}
    setLoading(false);
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    await notificationApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markUnread = useCallback(async (id: string) => {
    await notificationApi.markUnread(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
    );
    setUnreadCount((c) => c + 1);
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const deleteNotif = useCallback(async (id: string) => {
    const notif = notifications.find((n) => n.id === id);
    await notificationApi.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (notif && !notif.isRead) setUnreadCount((c) => Math.max(0, c - 1));
  }, [notifications]);

  const clearAll = useCallback(async () => {
    await notificationApi.clearAll();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Start polling
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markUnread,
    markAllRead,
    deleteNotif,
    clearAll,
    refresh: fetchUnreadCount,
  };
}

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import type { Notification } from "../api/notification.api";

const TYPE_ICON: Record<string, string> = {
  BUG_ASSIGNED:       "🐛",
  BUG_STATUS_CHANGED: "🔄",
  TEST_RUN_ASSIGNED:  "🧪",
  COMMENT_MENTION:    "💬",
  RETEST_REQUESTED:   "🔁",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)   return "just now";
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationBell() {
  const nav  = useNavigate();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markAllRead,
    deleteNotif,
  } = useNotifications();

  // Fetch when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead(n.id);
    if (n.link) {
      nav(n.link);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        title="Notifications"
        style={{
          position: "relative",
          background: open ? "var(--bg-elevated)" : "transparent",
          border: "1px solid transparent",
          borderColor: open ? "var(--border)" : "transparent",
          borderRadius: "var(--radius-md)",
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all var(--transition)",
          color: "var(--text-secondary)",
          fontSize: 18,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-elevated)";
          e.currentTarget.style.borderColor = "var(--border)";
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: 4,
            right: 4,
            background: "#ef4444",
            color: "#fff",
            borderRadius: "999px",
            fontSize: "0.6rem",
            fontWeight: 700,
            minWidth: 16,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 3px",
            lineHeight: 1,
            fontFamily: "var(--font-sans)",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 360,
          maxHeight: 480,
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            flexShrink: 0,
          }}>
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
              Notifications {unreadCount > 0 && (
                <span style={{ color: "var(--accent)", marginLeft: 4 }}>({unreadCount})</span>
              )}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={ghostBtnStyle}>Mark all read</button>
              )}
              <button
                onClick={() => { nav("/notifications"); setOpen(false); }}
                style={ghostBtnStyle}
              >
                See all
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Loading…
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>You're all caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: "flex",
                    gap: 10,
                    padding: "10px 16px",
                    cursor: n.link ? "pointer" : "default",
                    background: n.isRead ? "transparent" : "rgba(99,102,241,0.06)",
                    borderBottom: "1px solid var(--border)",
                    transition: "background var(--transition)",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-elevated)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(99,102,241,0.06)"; }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>
                    {TYPE_ICON[n.type] || "📌"}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      fontWeight: n.isRead ? 400 : 600,
                      fontSize: "0.82rem",
                      color: "var(--text-primary)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>{n.title}</p>
                    <p style={{
                      margin: "2px 0 0",
                      fontSize: "0.77rem",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}>{n.message}</p>
                    <p style={{ margin: "3px 0 0", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {/* Unread dot */}
                  {!n.isRead && (
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%",
                      background: "var(--accent)", flexShrink: 0, marginTop: 6,
                    }} />
                  )}
                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                    title="Dismiss"
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text-muted)", fontSize: 14, flexShrink: 0,
                      padding: 0, lineHeight: 1,
                    }}
                  >✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const ghostBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--accent)",
  fontSize: "0.75rem",
  fontWeight: 500,
  fontFamily: "var(--font-sans)",
  padding: 0,
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../api/notification.api';

const TYPE_ICON: Record<string, string> = {
  BUG_ASSIGNED: '🐛',
  BUG_STATUS_CHANGED: '🔄',
  TEST_RUN_ASSIGNED: '🧪',
  COMMENT_MENTION: '💬',
  RETEST_REQUESTED: '🔁',
};

const TYPE_LABEL: Record<string, string> = {
  BUG_ASSIGNED: 'Bug Assigned',
  BUG_STATUS_CHANGED: 'Status Changed',
  TEST_RUN_ASSIGNED: 'Test Assigned',
  COMMENT_MENTION: 'Mention',
  RETEST_REQUESTED: 'Re-test Request',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function NotificationsPage() {
  const nav = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markRead,
    markUnread,
    markAllRead,
    deleteNotif,
    clearAll,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications(filter === 'unread');
  }, [filter]);

  const handleClick = (n: Notification) => {
    if (!n.isRead) markRead(n.id);
    if (n.link) nav(n.link);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={secondaryBtnStyle}>
              ✓ Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                ...secondaryBtnStyle,
                color: '#ef4444',
                borderColor: '#ef4444',
              }}
            >
              🗑 Clear all
            </button>
          )}
          <button
            onClick={() => nav('/notifications/preferences')}
            style={secondaryBtnStyle}
          >
            ⚙ Preferences
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 3,
          width: 'fit-content',
          marginBottom: 20,
        }}
      >
        {(['all', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '6px 18px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              background: filter === tab ? 'var(--accent)' : 'transparent',
              color: filter === tab ? '#fff' : 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '0.82rem',
              fontFamily: 'var(--font-sans)',
              transition: 'all var(--transition)',
            }}
          >
            {tab === 'all'
              ? 'All'
              : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: 'var(--text-muted)',
          }}
        >
          Loading…
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: 80,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            No notifications
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {filter === 'unread'
              ? 'No unread notifications'
              : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          {notifications.map((n, i) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                gap: 14,
                padding: '14px 20px',
                background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                borderBottom:
                  i < notifications.length - 1
                    ? '1px solid var(--border)'
                    : 'none',
                transition: 'background var(--transition)',
                alignItems: 'flex-start',
                cursor: n.link ? 'pointer' : 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = n.isRead
                  ? 'transparent'
                  : 'rgba(99,102,241,0.05)';
              }}
              onClick={() => handleClick(n)}
            >
              {/* Icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}
              >
                {TYPE_ICON[n.type] || '📌'}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{
                      fontWeight: n.isRead ? 500 : 700,
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {n.title}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1px 6px',
                      color: 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_LABEL[n.type] || n.type}
                  </span>
                  {!n.isRead && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {n.message}
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {timeAgo(n.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => (n.isRead ? markUnread(n.id) : markRead(n.id))}
                  title={n.isRead ? 'Mark unread' : 'Mark read'}
                  style={iconBtnStyle}
                >
                  {n.isRead ? '○' : '✓'}
                </button>
                <button
                  onClick={() => deleteNotif(n.id)}
                  title="Dismiss"
                  style={{ ...iconBtnStyle, color: '#ef4444' }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const secondaryBtnStyle: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '7px 14px',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  fontSize: '0.82rem',
  fontWeight: 500,
  color: 'var(--text-secondary)',
  transition: 'all var(--transition)',
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  fontSize: 14,
  padding: '4px 6px',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-sans)',
  transition: 'all var(--transition)',
};

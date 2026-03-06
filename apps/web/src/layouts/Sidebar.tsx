// File: apps/web/src/layouts/Sidebar.tsx
import { NavLink, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../app/providers/AuthProvider';
import { useNotifications } from '../features/notifications/hooks/useNotifications';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/axios';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: string[];
}

const NAV: NavItem[] = [
  { path: 'dashboard', label: 'Dashboard', icon: '◈' },
  { path: 'test-cases', label: 'Test Cases', icon: '✎' },
  {
    path: 'test-suites',
    label: 'Test Suites',
    icon: '⊞',
    roles: ['ADMIN', 'TESTER'],
  },
  { path: 'test-runs', label: 'Test Runs', icon: '▷' },
  {
    path: 'executions',
    label: 'Executions',
    icon: '▶',
    roles: ['ADMIN', 'TESTER'],
  },
  { path: 'bugs', label: 'Bugs', icon: '⚠' },
  {
    path: 'milestones',
    label: 'Milestones',
    icon: '◎',
    roles: ['ADMIN', 'TESTER'],
  },
  { path: 'reports', label: 'Reports', icon: '⊡' },
  { path: 'settings', label: 'Settings', icon: '⚙' },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'linear-gradient(135deg, #c084fc, #7857ff)',
  DEVELOPER: 'linear-gradient(135deg, #3dd9ff, #7857ff)',
  TESTER: 'linear-gradient(135deg, #22d9a0, #3dd9ff)',
};

export const Sidebar = () => {
  const { user, logout } = useAuth() as any;
  const location = useLocation();
  //const navigate  = useNavigate();
  const { projectId: urlProjectId } = useParams<{ projectId: string }>();
  const { unreadCount } = useNotifications();

  // ✅ For developers: if no projectId in URL, fetch their projects and use the member one
  const [resolvedProjectId, setResolvedProjectId] = useState<
    string | undefined
  >(urlProjectId);

  useEffect(() => {
    // Always prefer the URL param — it's the source of truth
    if (urlProjectId) {
      setResolvedProjectId(urlProjectId);
      return;
    }
    // If no projectId in URL and user is a developer, find their member project
    if (user?.role === 'DEVELOPER') {
      apiClient
        .get('/api/projects')
        .then((r) => {
          const projects = r.data || [];
          // Prefer a project they don't own (i.e. the tester's project they were added to)
          const memberProject = projects.find(
            (p: any) => p.owner?.id !== user.id && p.status !== 'ARCHIVED'
          );
          const target =
            memberProject ?? projects.find((p: any) => p.status !== 'ARCHIVED');
          if (target) setResolvedProjectId(target.id);
        })
        .catch(() => {});
    }
  }, [urlProjectId, user?.role, user?.id]);

  const projectId = resolvedProjectId;

  const visible = NAV.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minHeight: '100vh',
        background: 'rgba(8, 10, 24, 0.92)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(120,87,255,0.6), rgba(61,217,255,0.3), transparent)',
        }}
      />

      {/* Logo */}
      <div
        style={{
          padding: '22px 20px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background:
                'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: '#fff',
              boxShadow:
                '0 4px 20px rgba(120,87,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
              flexShrink: 0,
            }}
          >
            T
          </div>
          <div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                background:
                  'linear-gradient(135deg, #eef0ff 0%, var(--accent-2) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              TestTrack
            </div>
            <div
              style={{
                fontSize: '0.62rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                marginTop: -2,
              }}
            >
              PRO
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 10px', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding: '0 10px',
            marginBottom: 8,
            fontFamily: 'var(--font-display)',
          }}
        >
          Workspace
        </div>

        <NavLink to="/projects" style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <SidebarNavItem
              icon="🗂"
              label="All Projects"
              active={isActive && location.pathname === '/projects'}
            />
          )}
        </NavLink>

        <NavLink to="/notifications" style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <SidebarNavItem
              icon="🔔"
              label="Notifications"
              active={
                isActive || location.pathname.startsWith('/notifications')
              }
              badge={
                unreadCount > 0
                  ? unreadCount > 99
                    ? '99+'
                    : String(unreadCount)
                  : undefined
              }
            />
          )}
        </NavLink>

        {projectId && (
          <>
            <div
              style={{
                fontSize: '0.6rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '16px 10px 8px',
                fontFamily: 'var(--font-display)',
              }}
            >
              Project
            </div>

            {visible.map((item) => {
              const to = `/projects/${projectId}/${item.path}`;
              const active = location.pathname.startsWith(to);
              return (
                <NavLink
                  key={item.path}
                  to={to}
                  style={{ textDecoration: 'none' }}
                >
                  {() => (
                    <SidebarNavItem
                      icon={item.icon}
                      label={item.label}
                      active={active}
                    />
                  )}
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div
        style={{
          padding: '12px 10px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: 8,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background:
                  ROLE_COLORS[user?.role] ||
                  'linear-gradient(135deg, #7857ff, #3dd9ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#fff',
                flexShrink: 0,
                fontFamily: 'var(--font-display)',
                boxShadow: '0 2px 10px rgba(120,87,255,0.4)',
              }}
            >
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-display)',
                }}
              >
                {user?.email?.split('@')[0]}
              </div>
              <div
                style={{
                  fontSize: '0.67rem',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.04em',
                }}
              >
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all var(--transition)',
            fontFamily: 'var(--font-sans)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,79,109,0.08)';
            e.currentTarget.style.borderColor = 'rgba(255,79,109,0.25)';
            e.currentTarget.style.color = 'var(--danger)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <span style={{ fontSize: '0.9rem' }}>⏻</span> Sign out
        </button>
      </div>
    </aside>
  );
};

const SidebarNavItem = ({
  icon,
  label,
  active,
  badge,
}: {
  icon: string;
  label: string;
  active: boolean;
  badge?: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 'var(--radius-md)',
      marginBottom: 2,
      background: active
        ? 'linear-gradient(135deg, rgba(120,87,255,0.15) 0%, rgba(61,217,255,0.06) 100%)'
        : 'transparent',
      color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
      fontWeight: active ? 600 : 400,
      fontSize: '0.875rem',
      transition: 'all var(--transition)',
      cursor: 'pointer',
      border: '1px solid',
      borderColor: active ? 'rgba(120,87,255,0.25)' : 'transparent',
      position: 'relative',
      fontFamily: active ? 'var(--font-display)' : 'var(--font-sans)',
    }}
    onMouseEnter={(e) => {
      if (!active) {
        (e.currentTarget as HTMLDivElement).style.background =
          'rgba(255,255,255,0.04)';
        (e.currentTarget as HTMLDivElement).style.color = 'var(--text-primary)';
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent';
        (e.currentTarget as HTMLDivElement).style.color =
          'var(--text-secondary)';
      }
    }}
  >
    {active && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 3,
          height: '60%',
          background: 'linear-gradient(180deg, var(--accent), var(--accent-2))',
          borderRadius: '0 3px 3px 0',
          boxShadow: '0 0 8px var(--accent-glow)',
        }}
      />
    )}
    <span
      style={{
        fontSize: '1rem',
        width: 20,
        textAlign: 'center',
        flexShrink: 0,
        filter: active ? 'drop-shadow(0 0 6px var(--accent-glow))' : 'none',
      }}
    >
      {icon}
    </span>
    <span style={{ flex: 1 }}>{label}</span>
    {badge && (
      <span
        style={{
          background: '#ef4444',
          color: '#fff',
          borderRadius: '100px',
          fontSize: '0.62rem',
          fontWeight: 700,
          minWidth: 18,
          height: 18,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
          lineHeight: 1,
          boxShadow: '0 0 8px rgba(239,68,68,0.5)',
        }}
      >
        {badge}
      </span>
    )}
  </div>
);

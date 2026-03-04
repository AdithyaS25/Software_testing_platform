// File: apps/web/src/layouts/Sidebar.tsx
import { NavLink, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";
import { useNotifications } from "../features/notifications/hooks/useNotifications";

interface NavItem { path: string; label: string; icon: string; roles?: string[]; }

const NAV: NavItem[] = [
  { path: "dashboard",   label: "Dashboard",   icon: "▦" },
  { path: "test-cases",  label: "Test Cases",  icon: "✎" },
  { path: "test-suites", label: "Test Suites", icon: "⊞",  roles: ["ADMIN","TESTER"] },
  { path: "test-runs",   label: "Test Runs",   icon: "▷" },
  { path: "executions",  label: "Executions",  icon: "▶",  roles: ["ADMIN","TESTER"] },
  { path: "bugs",        label: "Bugs",        icon: "⚠" },
  { path: "milestones",  label: "Milestones",  icon: "🎯", roles: ["ADMIN","TESTER"] },
  { path: "reports",     label: "Reports",     icon: "⊡" },
  { path: "settings",    label: "Settings",    icon: "⚙" },
];

export const Sidebar = () => {
  const { user, logout } = useAuth() as any;
  const location = useLocation();
  const { projectId } = useParams<{ projectId: string }>();
  const { unreadCount } = useNotifications();

  const visible = NAV.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
    borderRadius: "var(--radius-md)", marginBottom: 2,
    background: active ? "var(--accent-muted)" : "transparent",
    color: active ? "var(--accent)" : "var(--text-secondary)",
    fontWeight: active ? 600 : 400, fontSize: "0.875rem",
    transition: "all var(--transition)", cursor: "pointer",
    border: active ? "1px solid rgba(61,111,255,0.2)" : "1px solid transparent",
    textDecoration: "none",
  });

  return (
    <aside style={{
      width: "var(--sidebar-width)", minHeight: "100vh",
      background: "var(--bg-surface)", borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "var(--radius-sm)",
            background: "var(--accent)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "#fff",
          }}>T</div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>TestTrack</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pro</div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {/* Workspace section */}
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 12px", marginBottom: 6 }}>Workspace</div>

        <NavLink to="/projects" style={({ isActive }) => itemStyle(isActive && location.pathname === "/projects")}>
          <span style={{ fontSize: "1rem", width: 20, textAlign: "center", flexShrink: 0 }}>🗂</span>
          <span>All Projects</span>
        </NavLink>

        {/* Notifications — global */}
        <NavLink to="/notifications" style={({ isActive }) => itemStyle(isActive || location.pathname.startsWith("/notifications"))}>
          <span style={{ fontSize: "1rem", width: 20, textAlign: "center", flexShrink: 0 }}>🔔</span>
          <span style={{ flex: 1 }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{
              background: "#ef4444", color: "#fff", borderRadius: 999,
              fontSize: "0.65rem", fontWeight: 700, minWidth: 18, height: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px", lineHeight: 1,
            }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </NavLink>

        {/* Project-scoped nav */}
        {projectId && (
          <>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "12px 12px 6px" }}>Project</div>
            {visible.map(item => {
              const to     = `/projects/${projectId}/${item.path}`;
              const active = location.pathname.startsWith(to);
              return (
                <NavLink key={item.path} to={to} style={() => itemStyle(active)}>
                  <span style={{ fontSize: "1rem", width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px", borderTop: "1px solid var(--border-subtle)" }}>
        <div style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "10px 12px", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--accent-muted)", border: "1px solid var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email?.split("@")[0]}
              </div>
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{user?.role}</div>
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%", padding: "7px 12px",
            background: "transparent", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
            fontSize: "0.8rem", cursor: "pointer",
            transition: "all var(--transition)", fontFamily: "var(--font-sans)",
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

import { NavLink, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../app/providers/AuthProvider";

interface NavItem {
  path: string;
  label: string;
  icon: string;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  { path: "dashboard",   label: "Dashboard",   icon: "▦" },
  { path: "test-cases",  label: "Test Cases",  icon: "✎", roles: ["ADMIN", "TESTER", "DEVELOPER"] },
  { path: "test-suites", label: "Test Suites", icon: "⊞", roles: ["ADMIN", "TESTER"] },
  { path: "test-runs",   label: "Test Runs",   icon: "▷", roles: ["ADMIN", "TESTER", "DEVELOPER"] },
  { path: "bugs",        label: "Bugs",        icon: "⚠", roles: ["ADMIN", "TESTER", "DEVELOPER"] },
  { path: "reports",     label: "Reports",     icon: "⊡", roles: ["ADMIN", "TESTER", "DEVELOPER"] },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { projectId } = useParams();

  const visible = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <aside style={{
      width: "var(--sidebar-width)", minHeight: "100vh",
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "var(--radius-sm)",
            background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", fontWeight: 700, color: "#fff",
          }}>T</div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>TestTrack</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Pro</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 12px", marginBottom: 6 }}>Navigation</div>
        {visible.map(item => {
          const fullPath = projectId
            ? `/projects/${projectId}/${item.path}`
            : "/projects";
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink key={item.path} to={fullPath} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 12px", borderRadius: "var(--radius-md)",
                marginBottom: 2,
                background: isActive ? "var(--accent-muted)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                fontWeight: isActive ? 600 : 400,
                fontSize: "0.875rem",
                transition: "all var(--transition)",
                cursor: "pointer",
                border: `1px solid ${isActive ? "rgba(61,111,255,0.2)" : "transparent"}`,
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-hover)"; (e.currentTarget as HTMLDivElement).style.color = "var(--text-primary)"; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "var(--text-secondary)"; } }}
              >
                <span style={{ fontSize: "1rem", width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge ? (
                  <span style={{ padding: "1px 6px", borderRadius: 10, fontSize: "0.68rem", fontWeight: 700, background: "var(--danger)", color: "#fff" }}>{item.badge}</span>
                ) : null}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
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
              <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.04em" }}>{user?.role}</div>
            </div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: "100%", padding: "7px 12px",
          background: "transparent", border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
          fontSize: "0.8rem", cursor: "pointer", transition: "all var(--transition)",
          fontFamily: "var(--font-sans)", textAlign: "center",
        }}
        onMouseEnter={e => { (e.currentTarget).style.borderColor = "var(--danger)"; (e.currentTarget).style.color = "var(--danger)"; }}
        onMouseLeave={e => { (e.currentTarget).style.borderColor = "var(--border)"; (e.currentTarget).style.color = "var(--text-muted)"; }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
};

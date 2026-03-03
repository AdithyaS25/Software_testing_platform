import { useEffect, useState } from "react";
import { useAuth } from "../../../app/providers/AuthProvider";
import { getDashboardData } from "../api/dashboard.api";
import { StatCard, Card, Spinner } from "../../../shared/components/ui";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

export const DashboardPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData(projectId!).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><Spinner size={32} /></div>;

  const isTester = user?.role === "TESTER" || user?.role === "ADMIN";
  const isDev = user?.role === "DEVELOPER" || user?.role === "ADMIN";

  // API returns: { success, data: { summary: {...}, executionTrend, bugTrend } }
  const summary        = data?.summary ?? {};
  const executionTrend = data?.executionTrend ?? [];
  const bugTrend       = data?.bugTrend ?? [];

  const totalRuns    = summary.totalTestRuns   ?? "—";
  const totalExec    = summary.totalExecutions ?? "—";
  const passRate     = summary.overallPassRate ?? null;
  const totalBugs    = summary.totalBugs       ?? "—";
  const openBugs     = summary.openBugs        ?? "—";
  const criticalBugs = summary.criticalBugs    ?? "—";

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} 👋
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 3 }}>
          Here's what's happening in your workspace today
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {isTester && <>
          <StatCard label="Test Runs"  value={totalRuns} icon="▷" color="blue"   sub="Total runs" />
          <StatCard label="Executions" value={totalExec} icon="✎" color="purple" sub="All time" />
          <StatCard label="Pass Rate"  value={passRate != null ? `${Math.round(passRate)}%` : "—"} icon="✓" color="green" sub="Overall" />
        </>}
        {isDev && <>
          <StatCard label="Open Bugs"     value={openBugs}     icon="⚠"  color="yellow" sub="Needs attention" />
          <StatCard label="Critical Bugs" value={criticalBugs} icon="🔴" color="red"    sub="Blocker / Critical" />
        </>}
        <StatCard label="Total Bugs" value={totalBugs} icon="⊡" color="orange" sub="All statuses" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
        {isTester && executionTrend.length > 0 && (
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>Execution Trend</h3>
            <MiniBarChart data={executionTrend} color="var(--accent)" />
          </Card>
        )}
        {isDev && bugTrend.length > 0 && (
          <Card style={{ padding: 20 }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16, letterSpacing: "0.04em", textTransform: "uppercase" }}>Bug Trend</h3>
            <MiniBarChart data={bugTrend} color="var(--danger)" />
          </Card>
        )}
      </div>

      <Card style={{ padding: 20 }}>
        <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>Quick Actions</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {isTester && <QuickAction to={`/projects/${projectId}/test-cases/new`} icon="✎" label="New Test Case" color="var(--accent)" />}
          {isTester && <QuickAction to={`/projects/${projectId}/test-suites`}    icon="⊞" label="View Suites"   color="var(--purple)" />}
          {isTester && <QuickAction to={`/projects/${projectId}/test-runs`}      icon="▷" label="Test Runs"     color="var(--success)" />}
          <QuickAction to={`/projects/${projectId}/bugs`}    icon="⚠"  label="View Bugs" color="var(--danger)" />
          <QuickAction to={`/projects/${projectId}/reports`} icon="⊡"  label="Reports"   color="var(--warning)" />
        </div>
      </Card>
    </div>
  );
};

const QuickAction = ({ to, icon, label, color }: { to: string; icon: string; label: string; color: string }) => (
  <Link to={to} style={{ textDecoration: "none" }}>
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 14px", borderRadius: "var(--radius-md)",
      background: "var(--bg-elevated)", border: "1px solid var(--border)",
      color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 500,
      cursor: "pointer", transition: "all var(--transition)",
    }}
    onMouseEnter={e => { (e.currentTarget).style.borderColor = color; (e.currentTarget).style.color = color; }}
    onMouseLeave={e => { (e.currentTarget).style.borderColor = "var(--border)"; (e.currentTarget).style.color = "var(--text-secondary)"; }}>
      <span style={{ color }}>{icon}</span> {label}
    </div>
  </Link>
);

const MiniBarChart = ({ data, color }: { data: any[]; color: string }) => {
  if (!data?.length) return <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No data</div>;
  const maxVal = Math.max(...data.map((d: any) => d.count || d.value || d.total || 1));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
      {data.slice(-14).map((d: any, i: number) => {
        const v = d.count || d.value || d.total || 0;
        const h = Math.max(4, (v / maxVal) * 72);
        return (
          <div key={i} title={`${d.date || d.label || ""}: ${v}`} style={{
            flex: 1, height: h, borderRadius: 3,
            background: color, opacity: 0.7 + (i / data.length) * 0.3,
            transition: "height 0.3s ease",
          }} />
        );
      })}
    </div>
  );
};

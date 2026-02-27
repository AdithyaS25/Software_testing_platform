import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, Tabs, Spinner, StatCard, useToast } from "../../../shared/components/ui";

export const ReportsPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const [tab, setTab] = useState("bug");
  const [loading, setLoading] = useState(false);
  const [bugReport, setBugReport] = useState<any>(null);
  const [execReport, setExecReport] = useState<any>(null);
  const [devReport, setDevReport] = useState<any>(null);
  const [testerReport, setTesterReport] = useState<any>(null);
  const [testRunId, setTestRunId] = useState(params.get("testRunId") || "");
  const [runIdInput, setRunIdInput] = useState(params.get("testRunId") || "");

  const isTester = user?.role === "TESTER" || user?.role === "ADMIN";
  const isDev = user?.role === "DEVELOPER" || user?.role === "ADMIN";

  const loadBug = async () => {
    setLoading(true);
    try { const r = await apiClient.get("/reports/bug"); setBugReport(r.data.data || r.data); }
    catch { toast.error("Failed to load bug report"); }
    finally { setLoading(false); }
  };

  const loadExec = async () => {
    if (!testRunId) return;
    setLoading(true);
    try { const r = await apiClient.get(`/reports/test-execution/${testRunId}`); setExecReport(r.data.data || r.data); }
    catch { toast.error("Failed to load execution report"); }
    finally { setLoading(false); }
  };

  const loadDev = async () => {
    setLoading(true);
    try { const r = await apiClient.get("/reports/developer-performance"); setDevReport(r.data.data || r.data); }
    catch { toast.error("Failed to load developer report"); }
    finally { setLoading(false); }
  };

  const loadTester = async () => {
    setLoading(true);
    try { const r = await apiClient.get("/reports/tester-performance"); setTesterReport(r.data.data || r.data); }
    catch { toast.error("Failed to load tester report"); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "bug") loadBug();
    else if (tab === "exec" && testRunId) loadExec();
    else if (tab === "dev") loadDev();
    else if (tab === "tester") loadTester();
  }, [tab]);

  const exportCsv = async (type: "bug" | "exec") => {
    try {
      const url = type === "bug" ? "/reports/bug/export" : `/reports/test-execution/${testRunId}/export`;
      const r = await apiClient.get(url, { responseType: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(r.data);
      a.download = `${type}-report.csv`;
      a.click();
      toast.success("Report exported");
    } catch { toast.error("Export failed"); }
  };

  const tabs = [
    { id: "bug", label: "Bug Report" },
    ...(isTester || isDev ? [{ id: "exec", label: "Test Execution" }] : []),
    ...(isDev ? [{ id: "dev", label: "Developer Performance" }] : []),
    ...(isTester ? [{ id: "tester", label: "Tester Performance" }] : []),
  ];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 20, marginBottom: 16 }}>
      <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)" }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div><h1 className="page-title">Reports & Analytics</h1></div>
        <div style={{ display: "flex", gap: 8 }}>
          {tab === "bug" && <Button variant="secondary" size="sm" onClick={() => exportCsv("bug")}>⬇ Export CSV</Button>}
          {tab === "exec" && testRunId && <Button variant="secondary" size="sm" onClick={() => exportCsv("exec")}>⬇ Export CSV</Button>}
        </div>
      </div>

      <Tabs active={tab} onChange={setTab} tabs={tabs} />

      {loading && <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>}

      {/* Bug Report */}
      {tab === "bug" && !loading && bugReport && (
  <div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
      <StatCard label="Total Bugs" value={bugReport.summary?.total ?? "—"} icon="⊡" color="blue" />
      <StatCard label="Open"     value={bugReport.summary?.byStatus?.find((s: any) => s.status === "OPEN")?.count   ?? bugReport.summary?.byStatus?.find((s: any) => s.status === "NEW")?.count ?? "—"} icon="⚠" color="yellow" />
      <StatCard label="Fixed"    value={bugReport.summary?.byStatus?.find((s: any) => s.status === "FIXED")?.count  ?? "—"} icon="✓" color="green" />
      <StatCard label="Critical" value={bugReport.summary?.bySeverity?.find((s: any) => s.severity === "CRITICAL")?.count ?? "—"} icon="🔴" color="red" />
    </div>

    {bugReport.summary?.byStatus?.length > 0 && (
      <Section title="By Status">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {bugReport.summary.byStatus.map((item: any) => (
            <div key={item.status} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>{item.count ?? 0}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{item.status?.replace(/_/g, " ")}</div>
            </div>
          ))}
        </div>
      </Section>
    )}

    {bugReport.summary?.bySeverity?.length > 0 && (
      <Section title="By Severity">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {bugReport.summary.bySeverity.map((item: any) => (
            <div key={item.severity} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: item.severity === "BLOCKER" || item.severity === "CRITICAL" ? "var(--danger)" : "var(--text-primary)" }}>
                {item.count ?? 0}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{item.severity}</div>
            </div>
          ))}
        </div>
      </Section>
    )}

    {bugReport.summary?.byPriority?.length > 0 && (
      <Section title="By Priority">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {bugReport.summary.byPriority.map((item: any) => (
            <div key={item.priority} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>{item.count ?? 0}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{item.priority?.replace(/_/g, " ")}</div>
            </div>
          ))}
        </div>
      </Section>
    )}

    {bugReport.aging && (
      <Section title="Aging & Resolution">
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            ["Avg Days Open",      bugReport.aging.averageDaysOpen?.toFixed(1)],
            ["Oldest Open Bug",    bugReport.aging.oldestOpenBugDays?.toFixed(1) + " days"],
            ["Avg Resolution",     bugReport.resolutionMetrics?.averageResolutionDays?.toFixed(1) + " days"],
            ["Fastest Resolution", bugReport.resolutionMetrics?.fastestResolutionDays?.toFixed(1) + " days"],
          ].map(([label, val]) => (
            <div key={label} style={{ background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", padding: "10px 16px", minWidth: 140 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{val ?? "—"}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </Section>
    )}

    {bugReport.byDeveloper?.length > 0 && (
      <Section title="By Developer">
        <table className="tt-table">
          <thead><tr><th>Developer</th><th>Assigned</th><th>Fixed</th><th>Avg Resolution</th></tr></thead>
          <tbody>
            {bugReport.byDeveloper.map((d: any) => (
              <tr key={d.developerId ?? d.id}>
                <td>{d.developerName ?? d.email?.split("@")[0] ?? "—"}</td>
                <td>{d.totalAssigned ?? d.assigned ?? "—"}</td>
                <td>{d.totalFixed ?? d.fixed ?? "—"}</td>
                <td>{d.avgResolutionDays != null ? `${d.avgResolutionDays.toFixed(1)} days` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    )}
  </div>
)}

      {/* Test Execution Report */}
      {tab === "exec" && !loading && (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
            <input value={runIdInput} onChange={e => setRunIdInput(e.target.value)} placeholder="Enter Test Run ID..." style={{ maxWidth: 320 }} />
            <Button onClick={() => { setTestRunId(runIdInput); setTimeout(loadExec, 50); }}>Load Report</Button>
          </div>
          {execReport && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
                <StatCard label="Total" value={execReport.summary?.totalExecuted ?? execReport.total ?? "—"} icon="⊡" color="blue" />
                <StatCard label="Passed" value={execReport.summary?.passed ?? execReport.passed ?? "—"} icon="✓" color="green" />
                <StatCard label="Failed" value={execReport.summary?.failed ?? execReport.failed ?? "—"} icon="✗" color="red" />
                <StatCard label="Blocked" value={execReport.summary?.blocked ?? execReport.blocked ?? "—"} icon="!" color="yellow" />
                <StatCard label="Pass Rate" value={execReport.summary?.passRate != null ? `${Math.round(execReport.summary.passRate)}%` : "—"} icon="%" color="purple" />
              </div>

              {execReport.executionByModule?.length > 0 && (
                <Section title="By Module">
                  <table className="tt-table">
                    <thead><tr><th>Module</th><th>Total</th><th>Passed</th><th>Failed</th><th>Pass Rate</th></tr></thead>
                    <tbody>
                      {execReport.executionByModule.map((m: any) => (
                        <tr key={m.module}>
                          <td>{m.module}</td><td>{m.total}</td><td style={{ color: "var(--success)" }}>{m.passed}</td><td style={{ color: "var(--danger)" }}>{m.failed}</td>
                          <td><PassRateBar pct={m.total > 0 ? Math.round((m.passed / m.total) * 100) : 0} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}

              {execReport.failedTestCases?.length > 0 && (
                <Section title="Failed Test Cases">
                  <table className="tt-table">
                    <thead><tr><th>ID</th><th>Title</th><th>Module</th></tr></thead>
                    <tbody>
                      {execReport.failedTestCases.map((tc: any) => (
                        <tr key={tc.id}><td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>{tc.testCaseId}</td><td>{tc.title}</td><td>{tc.module}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              )}
            </>
          )}
        </div>
      )}

      {/* Developer Performance */}
      {tab === "dev" && !loading && devReport && (
        <Section title="Developer Performance">
          {Array.isArray(devReport) ? (
            <table className="tt-table">
              <thead><tr><th>Developer</th><th>Assigned</th><th>Resolved</th><th>Avg Resolution</th><th>Reopen Rate</th></tr></thead>
              <tbody>
                {devReport.map((d: any) => (
                  <tr key={d.id || d.email}>
                    <td>{d.email?.split("@")[0] || d.name}</td>
                    <td>{d.assigned ?? d.bugsAssigned ?? "—"}</td>
                    <td>{d.resolved ?? d.bugsResolved ?? "—"}</td>
                    <td>{d.avgResolutionDays != null ? `${d.avgResolutionDays.toFixed(1)} days` : "—"}</td>
                    <td>{d.reopenRate != null ? `${d.reopenRate}%` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <pre style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{JSON.stringify(devReport, null, 2)}</pre>}
        </Section>
      )}

      {/* Tester Performance */}
      {tab === "tester" && !loading && testerReport && (
        <Section title="Tester Performance">
          {Array.isArray(testerReport) ? (
            <table className="tt-table">
              <thead><tr><th>Tester</th><th>Executed</th><th>Bugs Found</th><th>Pass Rate</th></tr></thead>
              <tbody>
                {testerReport.map((t: any) => (
                  <tr key={t.id || t.email}>
                    <td>{t.email?.split("@")[0] || t.name}</td>
                    <td>{t.executed ?? t.testCasesExecuted ?? "—"}</td>
                    <td>{t.bugsFound ?? t.bugsReported ?? "—"}</td>
                    <td>{t.passRate != null ? <PassRateBar pct={Math.round(t.passRate)} /> : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <pre style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{JSON.stringify(testerReport, null, 2)}</pre>}
        </Section>
      )}
    </div>
  );
};

const PassRateBar = ({ pct }: { pct: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ flex: 1, height: 4, background: "var(--bg-elevated)", borderRadius: 2, minWidth: 60 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)", borderRadius: 2 }} />
    </div>
    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0 }}>{pct}%</span>
  </div>
);
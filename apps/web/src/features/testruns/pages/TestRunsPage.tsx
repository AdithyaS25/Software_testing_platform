import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, Badge, EmptyState, Modal, FormField, useToast, Spinner } from "../../../shared/components/ui";

export const TestRunsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", startDate: "", endDate: "", testCaseIds: "" });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const canCreate = user?.role === "ADMIN" || user?.role === "DEVELOPER" || user?.role === "TESTER";

  const load = () => {
    if (!projectId) return;
    setLoading(true);
    apiClient
      .get(`/api/projects/${projectId}/test-runs`)
      .then((r) => { setRuns(r.data.data || r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);

  const handleCreate = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        testCaseIds: form.testCaseIds.split(",").map(s => s.trim()).filter(Boolean),
      };
      await apiClient.post(`/api/projects/${projectId}/test-runs`, payload);
      toast.success("Test run created");
      setCreateModal(false);
      setForm({ name: "", description: "", startDate: "", endDate: "", testCaseIds: "" });
      load();
    } catch {
      toast.error("Failed to create test run");
    } finally {
      setSaving(false);
    }
  };

  const progressColor = (pct: number) =>
    pct >= 80 ? "var(--success)" : pct >= 50 ? "var(--warning)" : "var(--danger)";

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test Runs</h1>
          <p className="page-subtitle">{runs.length} test runs</p>
        </div>
        {canCreate && <Button icon="+" onClick={() => setCreateModal(true)}>New Test Run</Button>}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
      ) : runs.length === 0 ? (
        <EmptyState
          icon="▷" title="No test runs"
          desc="Create a test run to track execution cycles"
          action={canCreate ? <Button onClick={() => setCreateModal(true)}>Create Test Run</Button> : undefined}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {runs.map(run => {
            const total  = run.testCases?.length || run.totalCases || 0;
            const passed = run.passed || run.testCases?.filter((t: any) => t.status === "PASSED")?.length || 0;
            const pct    = total > 0 ? Math.round((passed / total) * 100) : 0;

            return (
              <div key={run.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <button
                          onClick={() => setExpanded(expanded === run.id ? null : run.id)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", padding: 0 }}
                        >
                          {expanded === run.id ? "▼" : "▶"}
                        </button>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{run.name}</span>
                        <Badge color="blue">{total} tests</Badge>
                        {run.status && (
                          <Badge color={run.status === "COMPLETED" ? "green" : run.status === "IN_PROGRESS" ? "yellow" : "gray"}>
                            {run.status?.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>
                      {run.description && (
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: 18, marginBottom: 8 }}>{run.description}</p>
                      )}

                      {/* Progress bar */}
                      <div style={{ marginLeft: 18 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <div style={{ flex: 1, height: 4, background: "var(--bg-elevated)", borderRadius: 2, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: progressColor(pct), borderRadius: 2, transition: "width 0.4s" }} />
                          </div>
                          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0 }}>{pct}%</span>
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: "0.75rem" }}>
                          {run.startDate && <span style={{ color: "var(--text-muted)" }}>Start: {new Date(run.startDate).toLocaleDateString()}</span>}
                          {run.endDate   && <span style={{ color: "var(--text-muted)" }}>End: {new Date(run.endDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {/* ← was nav(`/projects/${projectId}/reports?testRunId=${run.id}`)
                           which worked but the Reports page needs the tab set to "exec".
                           Now passing tab=exec so it lands on the execution report tab. */}
                      <Button
                        variant="secondary" size="sm"
                        onClick={() => nav(`/projects/${projectId}/reports?tab=exec&testRunId=${run.id}`)}
                      >
                        📊 View Report
                      </Button>

                      {/* Run all test cases in this test run */}
                      {(user?.role === "TESTER" || user?.role === "ADMIN") && (
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => nav(`/projects/${projectId}/executions?testRunId=${run.id}`)}
                        >
                          ▷ Execute
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded test cases */}
                {expanded === run.id && run.testCases?.length > 0 && (
                  <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <table className="tt-table">
                      <thead>
                        <tr><th>Test Case</th><th>Status</th><th>Assigned To</th></tr>
                      </thead>
                      <tbody>
                        {run.testCases.map((tc: any) => (
                          <tr key={tc.id}>
                            <td style={{ fontWeight: 500 }}>{tc.testCase?.title || tc.title || tc.id}</td>
                            <td>
                              <Badge color={tc.status === "PASSED" ? "green" : tc.status === "FAILED" ? "red" : tc.status === "BLOCKED" ? "yellow" : "gray"}>
                                {tc.status || "PENDING"}
                              </Badge>
                            </td>
                            <td>
                              <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                                {tc.assignedTo?.email?.split("@")[0] || "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Test Run" size="md">
        <FormField label="Name" required>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Sprint 5 Regression" required />
        </FormField>
        <FormField label="Description">
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} style={{ resize: "vertical" }} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Start Date" required>
            <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
          </FormField>
          <FormField label="End Date" required>
            <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
          </FormField>
        </div>
        <FormField label="Test Case IDs">
          <textarea
            value={form.testCaseIds}
            onChange={e => setForm(p => ({ ...p, testCaseIds: e.target.value }))}
            placeholder="Paste comma-separated test case IDs..."
            rows={3} style={{ resize: "vertical" }}
          />
        </FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleCreate}>Create Run</Button>
        </div>
      </Modal>
    </div>
  );
};
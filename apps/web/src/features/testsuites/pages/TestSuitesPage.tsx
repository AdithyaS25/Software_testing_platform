// File: apps/web/src/features/testsuites/pages/TestSuitesPage.tsx
// FIX: suite.testCases returns TestSuiteTestCase join records, not TestCase directly.
// The actual test case fields live at tc.testCase.title / tc.testCase.priority etc.
// Previously: tc.title was undefined -> blank rows in table.

import { useEffect, useState } from "react";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, Badge, StatusBadge, EmptyState, Modal, FormField, useToast, Spinner } from "../../../shared/components/ui";
import { useParams } from "react-router-dom";

export const TestSuitesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const toast = useToast();
  const [suites,      setSuites]      = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form,        setForm]        = useState({ name: "", description: "" });
  const [saving,      setSaving]      = useState(false);
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [addTcModal,  setAddTcModal]  = useState<string | null>(null);
  const [tcId,        setTcId]        = useState("");
  const [execModal,   setExecModal]   = useState<string | null>(null);
  const [execMode,    setExecMode]    = useState("SEQUENTIAL");

  const canEdit = user?.role === "TESTER" || user?.role === "ADMIN";

  const load = () => {
    if (!projectId) return;
    setLoading(true);
    apiClient.get(`/api/projects/${projectId}/test-suites`)
      .then(r => { setSuites(r.data.data || r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, [projectId]);

  const handleCreate = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await apiClient.post(`/api/projects/${projectId}/test-suites`, form);
      toast.success("Suite created"); setCreateModal(false); setForm({ name: "", description: "" }); load();
    } catch { toast.error("Failed to create suite"); } finally { setSaving(false); }
  };

  const handleClone   = async (id: string) => { try { await apiClient.post(`/api/projects/${projectId}/test-suites/${id}/clone`); toast.success("Cloned"); load(); } catch { toast.error("Failed"); } };
  const handleArchive = async (id: string, archived: boolean) => { try { await apiClient.patch(`/api/projects/${projectId}/test-suites/${id}/${archived ? "restore" : "archive"}`); toast.success(archived ? "Restored" : "Archived"); load(); } catch { toast.error("Failed"); } };

  const handleAddTc = async () => {
    if (!projectId || !addTcModal || !tcId) return;
    try {
      await apiClient.post(`/api/projects/${projectId}/test-suites/${addTcModal}/test-cases`, { testCaseId: tcId });
      toast.success("Test case added"); setAddTcModal(null); setTcId(""); load();
    } catch { toast.error("Failed to add test case"); }
  };

  const handleRemoveTc = async (suiteId: string, testCaseId: string) => {
    if (!projectId) return;
    // testCaseId passed here is the actual TestCase.id (tc.testCase.id)
    try { await apiClient.delete(`/api/projects/${projectId}/test-suites/${suiteId}/test-cases`, { data: { testCaseId } }); toast.success("Removed"); load(); }
    catch { toast.error("Failed"); }
  };

  const handleExecute = async () => {
    if (!projectId || !execModal) return;
    try { await apiClient.post(`/api/projects/${projectId}/test-suites/${execModal}/execute`, { executionMode: execMode }); toast.success("Suite execution started"); setExecModal(null); }
    catch { toast.error("Failed to start execution"); }
  };

  const priorityColor = (p: string) => p === "CRITICAL" ? "red" : p === "HIGH" ? "orange" : p === "MEDIUM" ? "yellow" : "gray";

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test Suites</h1>
          <p className="page-subtitle">{suites.length} suites</p>
        </div>
        {canEdit && <Button onClick={() => setCreateModal(true)}>+ New Suite</Button>}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
      ) : suites.length === 0 ? (
        <EmptyState icon="\u229e" title="No test suites" desc="Create a suite to group related test cases"
          action={canEdit ? <Button onClick={() => setCreateModal(true)}>Create Suite</Button> : undefined} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {suites.map(suite => (
            <div key={suite.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <button onClick={() => setExpanded(expanded === suite.id ? null : suite.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", padding: 0 }}>
                  {expanded === suite.id ? "\u25bc" : "\u25ba"}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{suite.name}</span>
                    {suite.isArchived && <Badge color="gray">Archived</Badge>}
                    <Badge color="blue">{suite.testCases?.length || 0} tests</Badge>
                  </div>
                  {suite.description && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{suite.description}</p>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {canEdit && !suite.isArchived && (
                    <>
                      <Button variant="success" size="sm" onClick={() => setExecModal(suite.id)}>\u25b7 Execute</Button>
                      <Button variant="secondary" size="sm" onClick={() => setAddTcModal(suite.id)}>+ Test Case</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleClone(suite.id)}>Clone</Button>
                    </>
                  )}
                  {canEdit && <Button variant="ghost" size="sm" onClick={() => handleArchive(suite.id, suite.isArchived)}>{suite.isArchived ? "Restore" : "Archive"}</Button>}
                </div>
              </div>

              {expanded === suite.id && (
                <div style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  {!suite.testCases?.length ? (
                    <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      No test cases yet.
                      {canEdit && <button onClick={() => setAddTcModal(suite.id)} style={{ marginLeft: 8, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>+ Add one</button>}
                    </div>
                  ) : (
                    <table className="tt-table">
                      <thead><tr><th>#</th><th>ID</th><th>Title</th><th>Priority</th><th>Status</th>{canEdit && <th></th>}</tr></thead>
                      <tbody>
                        {suite.testCases.map((tc: any, i: number) => {
                          // FIX: tc is TestSuiteTestCase join record. Real data at tc.testCase
                          const testCase = tc.testCase ?? tc;
                          return (
                            <tr key={tc.id}>
                              <td><span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>{i + 1}</span></td>
                              <td><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--text-muted)" }}>{testCase.testCaseId || "\u2014"}</span></td>
                              <td><span style={{ fontWeight: 500 }}>{testCase.title || "\u2014"}</span></td>
                              <td>{testCase.priority ? <Badge color={priorityColor(testCase.priority)}>{testCase.priority}</Badge> : "\u2014"}</td>
                              <td><StatusBadge value={testCase.status} /></td>
                              {canEdit && (
                                <td style={{ textAlign: "right" }}>
                                  <Button variant="ghost" size="sm" onClick={() => handleRemoveTc(suite.id, testCase.id)} style={{ color: "var(--danger)" }}>Remove</Button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={createModal} onClose={() => setCreateModal(false)} title="Create Test Suite" size="sm">
        <FormField label="Name" required><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. User Authentication Suite" /></FormField>
        <FormField label="Description"><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ resize: "vertical" }} /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setCreateModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleCreate}>Create Suite</Button>
        </div>
      </Modal>

      <Modal open={!!addTcModal} onClose={() => setAddTcModal(null)} title="Add Test Case to Suite" size="sm">
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 14 }}>Enter the Test Case ID (e.g. <code>TC-2025-00001</code>) or the UUID.</p>
        <FormField label="Test Case ID" required><input value={tcId} onChange={e => setTcId(e.target.value)} placeholder="TC-2025-00001 or UUID..." /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setAddTcModal(null)}>Cancel</Button>
          <Button onClick={handleAddTc}>Add</Button>
        </div>
      </Modal>

      <Modal open={!!execModal} onClose={() => setExecModal(null)} title="Execute Suite" size="sm">
        <FormField label="Execution Mode">
          <select value={execMode} onChange={e => setExecMode(e.target.value)}>
            <option value="SEQUENTIAL">Sequential</option>
            <option value="PARALLEL">Parallel</option>
          </select>
        </FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setExecModal(null)}>Cancel</Button>
          <Button onClick={handleExecute}>Start Execution</Button>
        </div>
      </Modal>
    </div>
  );
};
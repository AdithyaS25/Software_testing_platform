import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, PriorityBadge, SeverityBadge, StatusBadge, Badge, Spinner, FormField, useToast, Tabs, Modal } from "../../../shared/components/ui";

export const TestCaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [tc, setTc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("steps");
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const canEdit = user?.role === "TESTER" || user?.role === "ADMIN";

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/test-cases/${id}`).then(r => {
      const data = r.data.data || r.data;
      setTc(data);
      setEditForm({ title: data.title, description: data.description, module: data.module, priority: data.priority, severity: data.severity, status: data.status, type: data.type });
      setLoading(false);
    }).catch(() => { toast.error("Test case not found"); nav("/test-cases"); });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await apiClient.put(`/test-cases/${id}`, editForm);
      setTc((r.data.data || r.data));
      setEditModal(false);
      toast.success("Test case updated");
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><Spinner size={32} /></div>;
  if (!tc) return null;

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={() => nav("/test-cases")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", marginBottom: 12, fontFamily: "var(--font-sans)" }}>
          ← Test Cases
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 4 }}>{tc.testCaseId || id?.slice(0, 8)}</span>
              <StatusBadge value={tc.status} />
              <PriorityBadge value={tc.priority} />
            </div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{tc.title}</h1>
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            {canEdit && tc.status === "APPROVED" && (
              <Button variant="success" onClick={() => nav(`/execution/${id}`)}>▷ Execute</Button>
            )}
            {canEdit && <Button variant="secondary" onClick={() => setEditModal(true)}>Edit</Button>}
          </div>
        </div>
      </div>

      {/* Metadata strip */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: 20, fontSize: "0.8rem" }}>
        {[
          ["Module", tc.module || "—"],
          ["Type", tc.type],
          ["Severity", tc.severity],
          ["Automation", tc.automationStatus?.replace(/_/g, " ")],
          ["Est. Duration", tc.estimatedDuration ? `${tc.estimatedDuration} min` : "—"],
          ["Version", `v${tc.version || 1}`],
          ["Created by", tc.createdBy?.email?.split("@")[0] || "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <span style={{ color: "var(--text-muted)" }}>{k}: </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Tags */}
      {tc.tags?.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
          {tc.tags.map((t: string) => <Badge key={t} color="blue">{t}</Badge>)}
        </div>
      )}

      {/* Tabs */}
      <Tabs active={tab} onChange={setTab} tabs={[
        { id: "steps", label: "Test Steps", count: tc.steps?.length },
        { id: "conditions", label: "Pre/Post Conditions" },
        { id: "metadata", label: "Metadata" },
      ]} />

      {tab === "steps" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tc.steps?.length === 0 && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No steps defined.</p>}
          {tc.steps?.map((step: any, i: number) => (
            <div key={i} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-muted)", border: "1px solid var(--accent)", color: "var(--accent)", fontSize: "0.75rem", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{step.stepNumber}</span>
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Step {step.stepNumber}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Action</div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{step.action}</p>
                </div>
                <div>
                  <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Expected Result</div>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{step.expectedResult}</p>
                </div>
                {step.testData && (
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Test Data</div>
                    <p style={{ fontSize: "0.875rem", color: "var(--info)", fontFamily: "var(--font-mono)" }}>{step.testData}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "conditions" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[["Pre-conditions", tc.preconditions], ["Test Data Requirements", tc.testDataRequirements], ["Environment Requirements", tc.environmentRequirements], ["Post-conditions", tc.postconditions], ["Cleanup Steps", tc.cleanupSteps]].map(([label, val]) => (
            <div key={label} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
              <p style={{ fontSize: "0.875rem", color: val ? "var(--text-primary)" : "var(--text-muted)", whiteSpace: "pre-wrap" }}>{val || "Not specified"}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "metadata" && (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              ["Created By", tc.createdBy?.email], ["Created At", tc.createdAt ? new Date(tc.createdAt).toLocaleString() : "—"],
              ["Last Modified By", tc.lastModifiedBy?.email || "—"], ["Last Modified", tc.updatedAt ? new Date(tc.updatedAt).toLocaleString() : "—"],
              ["Version", `v${tc.version || 1}`], ["Automation Script", tc.automationScriptLink || "—"],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{v || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Test Case" size="lg">
        <FormField label="Title" required><input value={editForm.title || ""} onChange={e => setEditForm((p: any) => ({ ...p, title: e.target.value }))} /></FormField>
        <FormField label="Description"><textarea value={editForm.description || ""} onChange={e => setEditForm((p: any) => ({ ...p, description: e.target.value }))} rows={3} style={{ resize: "vertical" }} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Module"><input value={editForm.module || ""} onChange={e => setEditForm((p: any) => ({ ...p, module: e.target.value }))} /></FormField>
          <FormField label="Priority">
            <select value={editForm.priority || ""} onChange={e => setEditForm((p: any) => ({ ...p, priority: e.target.value }))}>
              {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </FormField>
          <FormField label="Severity">
            <select value={editForm.severity || ""} onChange={e => setEditForm((p: any) => ({ ...p, severity: e.target.value }))}>
              {["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select value={editForm.status || ""} onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
              {["DRAFT", "READY_FOR_REVIEW", "APPROVED", "DEPRECATED", "ARCHIVED"].map(v => <option key={v} value={v}>{v.replace(/_/g, " ")}</option>)}
            </select>
          </FormField>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setEditModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
};

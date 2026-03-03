// File: apps/web/src/features/milestones/pages/MilestonesPage.tsx
// NEW PAGE - Implements FR-PRJ-003: Project Milestones
// Matches Milestone model: name, description, targetDate, passRateTarget, status

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, Badge, EmptyState, Modal, FormField, useToast, Spinner } from "../../../shared/components/ui";

const STATUS_COLOR: Record<string, string> = {
  UPCOMING: "blue", IN_PROGRESS: "yellow", COMPLETED: "green", MISSED: "red",
};

export const MilestonesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const toast   = useToast();

  const [milestones,   setMilestones]   = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState(false);
  const [editTarget,   setEditTarget]   = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving,       setSaving]       = useState(false);

  const blank = { name: "", description: "", targetDate: "", passRateTarget: "", status: "UPCOMING" };
  const [form, setForm] = useState(blank);
  const ff = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const canEdit = user?.role === "ADMIN" || user?.role === "TESTER";

  const load = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const r = await apiClient.get(`/api/projects/${projectId}/milestones`);
      setMilestones(r.data.data || r.data || []);
    } finally { setLoading(false); }
  };
  if (!projectId || projectId === "default-project-001") {
  return <div style={{ padding: 40, color: "var(--text-muted)" }}>Select a project first.</div>;
}
  useEffect(() => { load(); }, [projectId]);

  const openCreate = () => { setForm(blank); setEditTarget(null); setModal(true); };
  const openEdit   = (m: any) => {
    setForm({ name: m.name, description: m.description || "", targetDate: m.targetDate?.split("T")[0] || "", passRateTarget: m.passRateTarget?.toString() || "", status: m.status });
    setEditTarget(m); setModal(true);
  };

  const handleSave = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const payload = {
        name:        form.name,
        targetDate:  form.targetDate,
        status:      form.status,
        ...(form.description    ? { description:    form.description }                  : {}),
        ...(form.passRateTarget ? { passRateTarget: parseFloat(form.passRateTarget) } : {}),
      };
      if (editTarget) {
        await apiClient.patch(`/api/projects/${projectId}/milestones/${editTarget.id}`, payload);
        toast.success("Milestone updated");
      } else {
        await apiClient.post(`/api/projects/${projectId}/milestones`, payload);
        toast.success("Milestone created");
      }
      setModal(false); load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to save milestone");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!projectId || !deleteTarget) return;
    try {
      await apiClient.delete(`/api/projects/${projectId}/milestones/${deleteTarget}`);
      toast.success("Milestone deleted"); setDeleteTarget(null); load();
    } catch { toast.error("Failed to delete"); }
  };

  const daysUntil = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (diff < 0)  return { label: `${Math.abs(diff)}d overdue`, color: "var(--danger)" };
    if (diff === 0) return { label: "Due today",                   color: "var(--warning)" };
    return           { label: `${diff}d remaining`,                color: "var(--text-muted)" };
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Milestones</h1>
          <p className="page-subtitle">{milestones.length} milestones</p>
        </div>
        {canEdit && <Button onClick={openCreate}>+ New Milestone</Button>}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
      ) : milestones.length === 0 ? (
        <EmptyState icon="🎯" title="No milestones yet" desc="Define milestones to track project progress against targets"
          action={canEdit ? <Button onClick={openCreate}>Create Milestone</Button> : undefined} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {milestones.map(m => {
            const due = m.targetDate ? daysUntil(m.targetDate) : null;
            return (
              <div key={m.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>{m.name}</span>
                      <Badge color={(STATUS_COLOR[m.status] ?? "gray") as any}>{m.status.replace(/_/g, " ")}</Badge>
                      {m.passRateTarget != null && (
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: "var(--radius-sm)" }}>
                          🎯 {m.passRateTarget}% pass target
                        </span>
                      )}
                    </div>
                    {m.description && <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 8 }}>{m.description}</p>}
                    <div style={{ display: "flex", gap: 16, fontSize: "0.78rem", flexWrap: "wrap" }}>
                      {m.targetDate && (
                        <span style={{ color: "var(--text-muted)" }}>
                          📅 {new Date(m.targetDate).toLocaleDateString()}
                          {due && <span style={{ marginLeft: 6, color: due.color }}>({due.label})</span>}
                        </span>
                      )}
                      {m.testRuns?.length > 0 && (
                        <span style={{ color: "var(--text-muted)" }}>▷ {m.testRuns.length} test runs linked</span>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={() => setDeleteTarget(m.id)}>Delete</Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editTarget ? "Edit Milestone" : "New Milestone"} size="md">
        <FormField label="Name" required>
          <input value={form.name} onChange={ff("name")} placeholder="e.g. Beta Release" />
        </FormField>
        <FormField label="Description">
          <textarea value={form.description} onChange={ff("description")} rows={2} style={{ resize: "vertical" }} placeholder="What does this milestone represent?" />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Target Date" required>
            <input type="date" value={form.targetDate} onChange={ff("targetDate")} />
          </FormField>
          <FormField label="Pass Rate Target (%)">
            <input type="number" value={form.passRateTarget} onChange={ff("passRateTarget")} placeholder="e.g. 95" min={0} max={100} step={0.1} />
          </FormField>
        </div>
        <FormField label="Status">
          <select value={form.status} onChange={ff("status")}>
            {["UPCOMING","IN_PROGRESS","COMPLETED","MISSED"].map(s => <option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
          </select>
        </FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setModal(false)}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>{editTarget ? "Update" : "Create"} Milestone</Button>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Milestone" size="sm">
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>Are you sure? This cannot be undone.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
};
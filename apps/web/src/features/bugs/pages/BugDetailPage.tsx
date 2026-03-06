// File: apps/web/src/features/bugs/pages/BugDetailPage.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, PriorityBadge, SeverityBadge, StatusBadge, Modal, FormField, Spinner, useToast, Tabs } from "../../../shared/components/ui";

// ✅ Fixed: use WONT_FIX (no apostrophe) to match the backend enum
const WORKFLOW: Record<string, string[]> = {
  NEW:         ["OPEN", "WONT_FIX", "DUPLICATE"],
  OPEN:        ["IN_PROGRESS", "WONT_FIX"],
  IN_PROGRESS: ["FIXED", "WONT_FIX"],
  FIXED:       ["VERIFIED", "REOPENED"],
  VERIFIED:    ["CLOSED"],
  REOPENED:    ["IN_PROGRESS"],
};

export const BugDetailPage = () => {
  const { projectId, id } = useParams<{ projectId: string; id: string }>();
  const { user } = useAuth();
  const nav   = useNavigate();
  const toast = useToast();

  const [bug,        setBug]        = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [comments,   setComments]   = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [tab,        setTab]        = useState("details");
  const [fixModal,   setFixModal]   = useState(false);
  const [fixNotes,   setFixNotes]   = useState("");
  const [posting,    setPosting]    = useState(false);

  // ✅ Assign modal with developer picker
  const [assignModal, setAssignModal] = useState(false);
  const [developers,  setDevelopers]  = useState<any[]>([]);
  const [assignId,    setAssignId]    = useState("");
  const [assigning,   setAssigning]   = useState(false);

  const [, setStatusModal] = useState<string | null>(null);

  const isDev    = user?.role === "DEVELOPER";
  const isTester = user?.role === "TESTER" || user?.role === "ADMIN";

  const bugPath     = `/api/projects/${projectId}/bugs/${id}`;
  const commentPath = `/api/projects/${projectId}/bugs/${id}/comments`;

  const load = () => {
    apiClient.get(bugPath)
      .then(r => { setBug(r.data.data || r.data); setLoading(false); })
      .catch(() => { toast.error("Bug not found"); nav(`/projects/${projectId}/bugs`); });
    apiClient.get(commentPath)
      .then(r => setComments(r.data.data || r.data || []));
  };

  const openAssignModal = async () => {
    setAssignModal(true);
    if (developers.length > 0) return;
    try {
      const r = await apiClient.get(`/api/users?role=DEVELOPER`);
      setDevelopers(r.data.data || r.data || []);
    } catch { /* fallback to manual entry */ }
  };

  useEffect(() => { load(); }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await apiClient.patch(`${bugPath}/status`, {
        status:   newStatus,
        fixNotes: fixModal ? fixNotes : undefined,
      });
      toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      setStatusModal(null);
      setFixModal(false);
      load();
    } catch { toast.error("Failed to update status"); }
  };

  const handleAssign = async () => {
    if (!assignId) { toast.error("Select a developer"); return; }
    setAssigning(true);
    try {
      await apiClient.patch(`${bugPath}/assign`, { assignedToId: assignId });
      toast.success("Bug assigned");
      setAssignModal(false);
      setAssignId("");
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to assign");
    } finally { setAssigning(false); }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await apiClient.post(commentPath, { content: newComment });
      setNewComment("");
      apiClient.get(commentPath).then(r => setComments(r.data.data || r.data || []));
    } catch { toast.error("Failed to post comment"); }
    finally { setPosting(false); }
  };

  const deleteComment = async (cid: string) => {
    try {
      await apiClient.delete(`/api/projects/${projectId}/bugs/comments/${cid}`);
      load();
    } catch { toast.error("Can only delete within 5 minutes"); }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><Spinner size={32} /></div>;
  if (!bug) return null;

  const nextStatuses = WORKFLOW[bug.status] || [];

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 900 }}>
      <button
        onClick={() => nav(`/projects/${projectId}/bugs`)}
        style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.85rem", marginBottom: 12, fontFamily: "var(--font-sans)" }}
      >
        ← Bugs
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-elevated)", padding: "2px 8px", borderRadius: 4 }}>{bug.bugId}</span>
            <StatusBadge value={bug.status} />
            <PriorityBadge value={bug.priority} />
            <SeverityBadge value={bug.severity} />
          </div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>{bug.title}</h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
          {isTester && !bug.assignedTo && (
            <Button variant="secondary" onClick={openAssignModal}>Assign Dev</Button>
          )}
          {isDev    && nextStatuses.includes("IN_PROGRESS") && <Button variant="primary"   onClick={() => handleStatusChange("IN_PROGRESS")}>Start Work</Button>}
          {isDev    && nextStatuses.includes("FIXED")       && <Button variant="success"   onClick={() => setFixModal(true)}>Mark Fixed</Button>}
          {isTester && nextStatuses.includes("VERIFIED")    && <Button variant="success"   onClick={() => handleStatusChange("VERIFIED")}>Verify Fix</Button>}
          {isTester && nextStatuses.includes("REOPENED")    && <Button variant="danger"    onClick={() => handleStatusChange("REOPENED")}>Reopen</Button>}
          {nextStatuses.includes("CLOSED")                  && <Button variant="secondary" onClick={() => handleStatusChange("CLOSED")}>Close</Button>}
          {/* ✅ Fixed: WONT_FIX matches backend enum */}
          {isTester && nextStatuses.includes("WONT_FIX")   && <Button variant="ghost"     onClick={() => handleStatusChange("WONT_FIX")}>Won't Fix</Button>}
        </div>
      </div>

      {/* Meta strip */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", padding: "12px 16px", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", marginBottom: 20, fontSize: "0.8rem" }}>
        {[
          ["Assigned To", bug.assignedTo?.email?.split("@")[0] || "Unassigned"],
          ["Reporter",    bug.reporter?.email?.split("@")[0]   || "—"],
          ["Linked Test", bug.testCase?.title                  || "—"],
          ["Environment", bug.environment                      || "—"],
          ["Version",     bug.affectedVersion                  || "—"],
          ["Created",     bug.createdAt ? new Date(bug.createdAt).toLocaleDateString() : "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <span style={{ color: "var(--text-muted)" }}>{k}: </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      <Tabs
        active={tab} onChange={setTab}
        tabs={[
          { id: "details",  label: "Details" },
          { id: "comments", label: "Comments", count: comments.length },
        ]}
      />

      {tab === "details" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["Description",        bug.description],
            ["Steps to Reproduce", bug.stepsToReproduce],
            ["Expected Behavior",  bug.expectedBehavior],
            ["Actual Behavior",    bug.actualBehavior],
            ...(bug.fixNotes ? [["Fix Notes", bug.fixNotes]] : []),
          ].filter(([, v]) => v).map(([label, val]) => (
            <div key={label} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16 }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "comments" && (
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {comments.length === 0 && (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", textAlign: "center", padding: 30 }}>No comments yet</p>
            )}
            {comments.map((c: any) => (
              <div key={c.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--accent-muted)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--accent)" }}>
                      {c.author?.email?.[0]?.toUpperCase()}
                    </div>
                    <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>{c.author?.email?.split("@")[0]}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  {c.author?.id === user?.id && (
                    <Button variant="ghost" size="sm" onClick={() => deleteComment(c.id)} style={{ color: "var(--danger)", fontSize: "0.7rem" }}>Delete</Button>
                  )}
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>{c.content}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." rows={3} style={{ flex: 1, resize: "vertical" }} />
            <Button loading={posting} onClick={handleComment} style={{ flexShrink: 0 }}>Post</Button>
          </div>
        </div>
      )}

      {/* ✅ Assign Modal — developer picker */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Bug to Developer" size="sm">
        <FormField label="Select Developer">
          {developers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
              {developers.map((dev: any) => (
                <div
                  key={dev.id}
                  onClick={() => setAssignId(dev.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", cursor: "pointer",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${assignId === dev.id ? "var(--accent)" : "var(--border)"}`,
                    background: assignId === dev.id ? "var(--accent-muted)" : "transparent",
                    transition: "all var(--transition)",
                  }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-muted)", border: "1px solid var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)" }}>
                    {dev.email?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>{dev.email?.split("@")[0]}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{dev.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <input value={assignId} onChange={e => setAssignId(e.target.value)} placeholder="Enter developer user ID..." />
          )}
        </FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setAssignModal(false)}>Cancel</Button>
          <Button loading={assigning} onClick={handleAssign}>Assign</Button>
        </div>
      </Modal>

      {/* Fix Modal */}
      <Modal open={fixModal} onClose={() => setFixModal(false)} title="Mark as Fixed" size="sm">
        <FormField label="Fix Notes" required>
          <textarea value={fixNotes} onChange={e => setFixNotes(e.target.value)} placeholder="Describe what you fixed..." rows={4} style={{ resize: "vertical" }} />
        </FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setFixModal(false)}>Cancel</Button>
          <Button variant="success" onClick={() => handleStatusChange("FIXED")}>Mark Fixed</Button>
        </div>
      </Modal>
    </div>
  );
};

import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { Button, StatusBadge, Modal, FormField, useToast, Spinner } from "../../../shared/components/ui";

type StepStatus = "PENDING" | "PASS" | "FAIL" | "BLOCKED" | "SKIPPED";

export const ExecutionPage = () => {
  const { testCaseId } = useParams<{ testCaseId: string }>();
  const nav = useNavigate();
  const toast = useToast();
  const [tc, setTc] = useState<any>(null);
  const [execution, setExecution] = useState<any>(null);
  const [stepStatuses, setStepStatuses] = useState<Record<string, { status: StepStatus; actualResult: string; notes: string }>>({});
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [bugModal, setBugModal] = useState<{ stepId: string; stepNum: number } | null>(null);
  const [evidenceModal, setEvidenceModal] = useState<{ stepId: string } | null>(null);
  const [bugForm, setBugForm] = useState({ title: "", description: "", severity: "MAJOR", priority: "P2-HIGH" });

  useEffect(() => {
    const init = async () => {
      const tcRes = await apiClient.get(`/test-cases/${testCaseId}`);
      const tcData = tcRes.data.data || tcRes.data;
      setTc(tcData);
      // Create execution
      const exRes = await apiClient.post("/executions", { testCaseId });
      const exData = exRes.data.data || exRes.data;
      setExecution(exData);
      // Initialize step statuses
      const init: Record<string, any> = {};
      (exData.steps || tcData.steps || []).forEach((s: any) => {
        init[s.id] = { status: "PENDING", actualResult: "", notes: "" };
      });
      setStepStatuses(init);
      setLoading(false);
      setTimerActive(true);
    };
    init().catch(() => { toast.error("Failed to start execution"); nav(`/test-cases/${testCaseId}`); });
  }, [testCaseId]);

  useEffect(() => {
    if (timerActive) timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const setStepStatus = (stepId: string, status: StepStatus) =>
    setStepStatuses(p => ({ ...p, [stepId]: { ...p[stepId], status } }));

  const setStepField = (stepId: string, field: string, val: string) =>
    setStepStatuses(p => ({ ...p, [stepId]: { ...p[stepId], [field]: val } }));

  const saveStep = async (stepId: string) => {
    const s = stepStatuses[stepId];
    if (s.status === "PENDING") return;
    await apiClient.patch(`/executions/${execution.id}`, {
      steps: [{ id: stepId, status: s.status, actualResult: s.actualResult, notes: s.notes }]
    });
  };

  const handleComplete = async () => {
    setCompleting(true);
    setTimerActive(false);
    try {
      // Save all steps
      const steps = Object.entries(stepStatuses).map(([id, s]) => ({ id, status: s.status === "PENDING" ? "SKIPPED" : s.status, actualResult: s.actualResult, notes: s.notes }));
      await apiClient.patch(`/executions/${execution.id}`, { steps });
      const res = await apiClient.post(`/executions/${execution.id}/complete`);
      const result = (res.data.data || res.data).status;
      toast.success(`Execution completed: ${result}`);
      nav(`/test-cases/${testCaseId}`);
    } catch { toast.error("Failed to complete execution"); }
    finally { setCompleting(false); }
  };

  const handleFailAndBug = async () => {
    if (!bugModal) return;
    try {
      await apiClient.post(`/executions/${execution.id}/steps/${bugModal.stepId}/fail-and-create-bug`, bugForm);
      setStepStatus(bugModal.stepId, "FAIL");
      toast.success("Step failed and bug created");
      setBugModal(null);
    } catch { toast.error("Failed to create bug"); }
  };

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!evidenceModal || !e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append("file", e.target.files[0]);
    try {
      await apiClient.post(`/executions/${execution.id}/steps/${evidenceModal.stepId}/evidence`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Evidence uploaded");
      setEvidenceModal(null);
    } catch { toast.error("Failed to upload evidence"); }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", paddingTop: 80 }}><Spinner size={32} /></div>;

  const steps = execution?.steps || tc?.steps || [];
  const completed = Object.values(stepStatuses).filter((s: any) => s.status !== "PENDING").length;
  const progress = steps.length ? (completed / steps.length) * 100 : 0;

  const statusColors: Record<StepStatus, string> = {
    PENDING: "var(--text-muted)", PASS: "var(--success)", FAIL: "var(--danger)",
    BLOCKED: "var(--warning)", SKIPPED: "var(--text-muted)",
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)" }}>Executing: {tc?.title}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 2 }}>{completed} of {steps.length} steps completed</p>
        </div>
        <div style={{ display: "flex", align: "center", gap: 12 }}>
          {/* Timer */}
          <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: timerActive ? "var(--success)" : "var(--warning)" }}>
            {fmt(timer)}
          </div>
          <Button variant="secondary" size="sm" onClick={() => setTimerActive(a => !a)}>
            {timerActive ? "⏸ Pause" : "▷ Resume"}
          </Button>
          <Button loading={completing} onClick={handleComplete} variant="primary">Complete Execution</Button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: "var(--bg-elevated)", borderRadius: 2, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {steps.map((step: any, i: number) => {
          const s = stepStatuses[step.id] || { status: "PENDING" as StepStatus, actualResult: "", notes: "" };
          const borderColor = s.status === "PASS" ? "var(--success)" : s.status === "FAIL" ? "var(--danger)" : s.status === "BLOCKED" ? "var(--warning)" : "var(--border)";
          return (
            <div key={step.id} style={{ background: "var(--bg-surface)", border: `1px solid ${borderColor}`, borderRadius: "var(--radius-lg)", padding: 20, transition: "border-color 0.2s" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${statusColors[s.status]}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.75rem", fontWeight: 700, color: statusColors[s.status] }}>
                  {s.status === "PASS" ? "✓" : s.status === "FAIL" ? "✗" : s.status === "BLOCKED" ? "!" : s.status === "SKIPPED" ? "—" : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Action</div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{step.action}</p>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Expected Result</div>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{step.expectedResult}</p>
                    </div>
                    {step.testData && <div>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Test Data</div>
                      <p style={{ fontSize: "0.875rem", color: "var(--info)", fontFamily: "var(--font-mono)" }}>{step.testData}</p>
                    </div>}
                  </div>

                  {/* Actual result */}
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 4 }}>Actual Result</label>
                    <textarea value={s.actualResult} onChange={e => setStepField(step.id, "actualResult", e.target.value)} placeholder="What actually happened..." rows={2} style={{ resize: "vertical" }} onBlur={() => saveStep(step.id)} />
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    {(["PASS", "FAIL", "BLOCKED", "SKIPPED"] as StepStatus[]).map(st => (
                      <button key={st} onClick={() => { setStepStatus(step.id, st); setTimeout(() => saveStep(step.id), 100); }} style={{
                        padding: "5px 14px", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", fontWeight: 600,
                        border: `1px solid ${s.status === st ? statusColors[st] : "var(--border)"}`,
                        background: s.status === st ? `${statusColors[st]}20` : "var(--bg-elevated)",
                        color: s.status === st ? statusColors[st] : "var(--text-muted)",
                        cursor: "pointer", transition: "all var(--transition)",
                      }}>{st}</button>
                    ))}
                    <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                      <Button variant="ghost" size="sm" onClick={() => setEvidenceModal({ stepId: step.id })}>📎 Evidence</Button>
                      {s.status !== "PASS" && (
                        <Button variant="danger" size="sm" onClick={() => setBugModal({ stepId: step.id, stepNum: step.stepNumber })}>⚠ Fail & Bug</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fail & Bug Modal */}
      <Modal open={!!bugModal} onClose={() => setBugModal(null)} title={`Fail Step ${bugModal?.stepNum} & Create Bug`} size="md">
        <FormField label="Bug Title" required>
          <input value={bugForm.title} onChange={e => setBugForm(p => ({ ...p, title: e.target.value }))} placeholder="Brief description of the bug..." />
        </FormField>
        <FormField label="Description" required>
          <textarea value={bugForm.description} onChange={e => setBugForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Steps, actual vs expected behavior..." style={{ resize: "vertical" }} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Severity">
            <select value={bugForm.severity} onChange={e => setBugForm(p => ({ ...p, severity: e.target.value }))}>
              {["BLOCKER", "CRITICAL", "MAJOR", "MINOR", "TRIVIAL"].map(v => <option key={v}>{v}</option>)}
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={bugForm.priority} onChange={e => setBugForm(p => ({ ...p, priority: e.target.value }))}>
              {["P1-URGENT", "P2-HIGH", "P3-MEDIUM", "P4-LOW"].map(v => <option key={v}>{v}</option>)}
            </select>
          </FormField>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
          <Button variant="secondary" onClick={() => setBugModal(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleFailAndBug}>Fail Step & Create Bug</Button>
        </div>
      </Modal>

      {/* Evidence Modal */}
      <Modal open={!!evidenceModal} onClose={() => setEvidenceModal(null)} title="Upload Evidence" size="sm">
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 16 }}>Upload screenshot, video, or log file as evidence for this step.</p>
        <input type="file" accept="image/*,video/*,.log,.txt,.har" onChange={handleEvidenceUpload} style={{ color: "var(--text-primary)" }} />
      </Modal>
    </div>
  );
};

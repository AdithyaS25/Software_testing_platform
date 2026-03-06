import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';
import {
  Button,
  Modal,
  FormField,
  useToast,
  Spinner,
} from '../../../shared/components/ui';

type StepStatus = 'PENDING' | 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIPPED';

export const ExecutionPage = () => {
  const { projectId, testCaseId } = useParams<{
    projectId: string;
    testCaseId: string;
  }>();
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const toast = useToast();

  const [tc, setTc] = useState<any>(null);
  const [execution, setExecution] = useState<any>(null);
  const [stepStatuses, setStepStatuses] = useState<
    Record<string, { status: StepStatus; actualResult: string; notes: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [bugModal, setBugModal] = useState<{
    stepId: string;
    stepNum: number;
  } | null>(null);
  const [evidenceModal, setEvidenceModal] = useState<{ stepId: string } | null>(
    null
  );
  const [runModal, setRunModal] = useState(!testCaseId); // show picker if no testCaseId
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [selectedRunId, setSelectedRunId] = useState(
    searchParams.get('testRunId') || ''
  );
  const [selectedTcId, setSelectedTcId] = useState(testCaseId || '');
  const [testCases, setTestCases] = useState<any[]>([]);

  const [bugForm, setBugForm] = useState({
    title: '',
    description: '',
    severity: 'MAJOR',
    priority: 'P3_MEDIUM',
  });

  // Load test runs and test cases for the picker modal
  useEffect(() => {
    if (!projectId) return;
    apiClient
      .get(`/api/projects/${projectId}/test-runs`)
      .then((r) => setTestRuns(r.data.data || r.data || []));
    apiClient
      .get(`/api/projects/${projectId}/test-cases`)
      .then((r) =>
        setTestCases(
          r.data.data?.items || r.data.items || r.data.data || r.data || []
        )
      );
  }, [projectId]);

  const startExecution = async (tcId: string, runId: string) => {
    if (!tcId || !runId) {
      toast.error('Select both a test case and a test run');
      return;
    }
    setLoading(true);
    try {
      // Fetch test case details
      const tcRes = await apiClient.get(
        `/api/projects/${projectId}/test-cases/${tcId}`
      );
      const tcData = tcRes.data.data || tcRes.data;
      setTc(tcData);

      // Create execution — backend requires testCaseId + testRunId
      const exRes = await apiClient.post(
        `/api/projects/${projectId}/executions`,
        {
          testCaseId: tcId,
          testRunId: runId,
        }
      );
      const exData = exRes.data.data || exRes.data;
      setExecution(exData);

      // Init step statuses
      const init: Record<string, any> = {};
      (exData.steps || tcData.steps || []).forEach((s: any) => {
        init[s.id] = { status: 'PENDING', actualResult: '', notes: '' };
      });
      setStepStatuses(init);
      setRunModal(false);
      setLoading(false);
      setTimerActive(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to start execution');
      setLoading(false);
    }
  };

  // Auto-start if testCaseId and testRunId are both in URL
  useEffect(() => {
    const runId = searchParams.get('testRunId') || '';
    if (testCaseId && runId) {
      startExecution(testCaseId, runId);
    } else if (testCaseId && !runId) {
      // testCase known, run unknown — show picker with tc pre-selected
      setSelectedTcId(testCaseId);
      setRunModal(true);
      setLoading(false);
    } else {
      // Nothing in URL — show full picker
      setRunModal(true);
      setLoading(false);
    }
  }, []);

  // Timer
  useEffect(() => {
    if (timerActive)
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const setStepStatus = (stepId: string, status: StepStatus) =>
    setStepStatuses((p) => ({ ...p, [stepId]: { ...p[stepId], status } }));

  const setStepField = (stepId: string, field: string, val: string) =>
    setStepStatuses((p) => ({
      ...p,
      [stepId]: { ...p[stepId], [field]: val },
    }));

  const saveStep = async (stepId: string) => {
    const s = stepStatuses[stepId];
    if (!s || s.status === 'PENDING') return;
    await apiClient.patch(
      `/api/projects/${projectId}/executions/${execution.id}`,
      {
        steps: [
          {
            id: stepId,
            status: s.status,
            actualResult: s.actualResult,
            notes: s.notes,
          },
        ],
      }
    );
  };

  const handleComplete = async () => {
    setCompleting(true);
    setTimerActive(false);
    try {
      const steps = Object.entries(stepStatuses).map(([id, s]) => ({
        id,
        status: s.status === 'PENDING' ? 'SKIPPED' : s.status,
        actualResult: s.actualResult,
        notes: s.notes,
      }));
      await apiClient.patch(
        `/api/projects/${projectId}/executions/${execution.id}`,
        { steps }
      );
      const res = await apiClient.post(
        `/api/projects/${projectId}/executions/${execution.id}/complete`
      );
      const result = (res.data.data || res.data).status;
      toast.success(`Execution completed: ${result}`);
      nav(`/projects/${projectId}/test-cases`);
    } catch {
      toast.error('Failed to complete execution');
    } finally {
      setCompleting(false);
    }
  };

  const handleFailAndBug = async () => {
    if (!bugModal) return;
    try {
      await apiClient.post(
        `/api/projects/${projectId}/executions/${execution.id}/steps/${bugModal.stepId}/fail-and-create-bug`,
        bugForm
      );
      setStepStatus(bugModal.stepId, 'FAIL');
      toast.success('Step failed and bug created');
      setBugModal(null);
    } catch {
      toast.error('Failed to create bug');
    }
  };

  const handleEvidenceUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!evidenceModal || !e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    try {
      await apiClient.post(
        `/api/projects/${projectId}/executions/${execution.id}/steps/${evidenceModal.stepId}/evidence`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Evidence uploaded');
      setEvidenceModal(null);
    } catch {
      toast.error('Failed to upload evidence');
    }
  };

  const statusColors: Record<StepStatus, string> = {
    PENDING: 'var(--text-muted)',
    PASS: 'var(--success)',
    FAIL: 'var(--danger)',
    BLOCKED: 'var(--warning)',
    SKIPPED: 'var(--text-muted)',
  };

  // ── Test Run / Test Case Picker Modal ──────────────────────────────────
  if (runModal) {
    return (
      <div
        style={{
          animation: 'fadeIn 0.3s ease',
          maxWidth: 520,
          margin: '60px auto',
        }}
      >
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 32,
          }}
        >
          <h2
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 6,
            }}
          >
            Start Execution
          </h2>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: 24,
            }}
          >
            Select a test case and test run to begin execution.
          </p>

          <FormField label="Test Case" required>
            <select
              value={selectedTcId}
              onChange={(e) => setSelectedTcId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">— Select test case —</option>
              {testCases.map((tc: any) => (
                <option key={tc.id} value={tc.id}>
                  {tc.testCaseId} — {tc.title}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Test Run" required>
            <select
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">— Select test run —</option>
              {testRuns.map((r: any) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </FormField>

          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'flex-end',
              marginTop: 20,
            }}
          >
            <Button
              variant="secondary"
              onClick={() => nav(`/projects/${projectId}/test-cases`)}
            >
              Cancel
            </Button>
            <Button onClick={() => startExecution(selectedTcId, selectedRunId)}>
              Start Execution
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading)
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}
      >
        <Spinner size={32} />
      </div>
    );

  const steps = execution?.steps || tc?.steps || [];
  const completed = Object.values(stepStatuses).filter(
    (s: any) => s.status !== 'PENDING'
  ).length;
  const progress = steps.length ? (completed / steps.length) * 100 : 0;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 900 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Executing: {tc?.title}
          </h1>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              marginTop: 2,
            }}
          >
            {completed} of {steps.length} steps completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '1.1rem',
              color: timerActive ? 'var(--success)' : 'var(--warning)',
            }}
          >
            {fmt(timer)}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setTimerActive((a) => !a)}
          >
            {timerActive ? '⏸ Pause' : '▷ Resume'}
          </Button>
          <Button loading={completing} onClick={handleComplete}>
            Complete Execution
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div
        style={{
          height: 4,
          background: 'var(--bg-elevated)',
          borderRadius: 2,
          marginBottom: 24,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--accent)',
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step: any, i: number) => {
          const s = stepStatuses[step.id] || {
            status: 'PENDING' as StepStatus,
            actualResult: '',
            notes: '',
          };
          const borderColor =
            s.status === 'PASS'
              ? 'var(--success)'
              : s.status === 'FAIL'
                ? 'var(--danger)'
                : s.status === 'BLOCKED'
                  ? 'var(--warning)'
                  : 'var(--border)';
          return (
            <div
              key={step.id}
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${borderColor}`,
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                transition: 'border-color 0.2s',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: `2px solid ${statusColors[s.status]}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: statusColors[s.status],
                  }}
                >
                  {s.status === 'PASS'
                    ? '✓'
                    : s.status === 'FAIL'
                      ? '✗'
                      : s.status === 'BLOCKED'
                        ? '!'
                        : s.status === 'SKIPPED'
                          ? '—'
                          : i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 16,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                        }}
                      >
                        Action
                      </div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {step.action}
                      </p>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                        }}
                      >
                        Expected Result
                      </div>
                      <p
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {step.expectedResult}
                      </p>
                    </div>
                    {step.testData && (
                      <div>
                        <div
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            color: 'var(--text-muted)',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                            marginBottom: 4,
                          }}
                        >
                          Test Data
                        </div>
                        <p
                          style={{
                            fontSize: '0.875rem',
                            color: 'var(--info, #60a5fa)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {step.testData}
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-muted)',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        display: 'block',
                        marginBottom: 4,
                      }}
                    >
                      Actual Result
                    </label>
                    <textarea
                      value={s.actualResult}
                      onChange={(e) =>
                        setStepField(step.id, 'actualResult', e.target.value)
                      }
                      placeholder="What actually happened..."
                      rows={2}
                      style={{ resize: 'vertical' }}
                      onBlur={() => saveStep(step.id)}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    {(
                      ['PASS', 'FAIL', 'BLOCKED', 'SKIPPED'] as StepStatus[]
                    ).map((st) => (
                      <button
                        key={st}
                        onClick={() => {
                          setStepStatus(step.id, st);
                          setTimeout(() => saveStep(step.id), 100);
                        }}
                        style={{
                          padding: '5px 14px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          border: `1px solid ${s.status === st ? statusColors[st] : 'var(--border)'}`,
                          background:
                            s.status === st
                              ? `${statusColors[st]}20`
                              : 'var(--bg-elevated)',
                          color:
                            s.status === st
                              ? statusColors[st]
                              : 'var(--text-muted)',
                          cursor: 'pointer',
                          transition: 'all var(--transition)',
                        }}
                      >
                        {st}
                      </button>
                    ))}
                    <div
                      style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEvidenceModal({ stepId: step.id })}
                      >
                        📎 Evidence
                      </Button>
                      {s.status !== 'PASS' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            setBugModal({
                              stepId: step.id,
                              stepNum: step.stepNumber,
                            })
                          }
                        >
                          ⚠ Fail & Bug
                        </Button>
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
      <Modal
        open={!!bugModal}
        onClose={() => setBugModal(null)}
        title={`Fail Step ${bugModal?.stepNum} & Create Bug`}
        size="md"
      >
        <FormField label="Bug Title" required>
          <input
            value={bugForm.title}
            onChange={(e) =>
              setBugForm((p) => ({ ...p, title: e.target.value }))
            }
            placeholder="Brief description of the bug..."
          />
        </FormField>
        <FormField label="Description" required>
          <textarea
            value={bugForm.description}
            onChange={(e) =>
              setBugForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
            placeholder="Steps, actual vs expected behavior..."
            style={{ resize: 'vertical' }}
          />
        </FormField>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
          <FormField label="Severity">
            <select
              value={bugForm.severity}
              onChange={(e) =>
                setBugForm((p) => ({ ...p, severity: e.target.value }))
              }
            >
              {['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Priority">
            <select
              value={bugForm.priority}
              onChange={(e) =>
                setBugForm((p) => ({ ...p, priority: e.target.value }))
              }
            >
              {/* ← fixed: underscore format matching BugPriority enum */}
              {[
                ['P1_URGENT', 'P1 Urgent'],
                ['P2_HIGH', 'P2 High'],
                ['P3_MEDIUM', 'P3 Medium'],
                ['P4_LOW', 'P4 Low'],
              ].map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            marginTop: 16,
          }}
        >
          <Button variant="secondary" onClick={() => setBugModal(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleFailAndBug}>
            Fail Step & Create Bug
          </Button>
        </div>
      </Modal>

      {/* Evidence Modal */}
      <Modal
        open={!!evidenceModal}
        onClose={() => setEvidenceModal(null)}
        title="Upload Evidence"
        size="sm"
      >
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            marginBottom: 16,
          }}
        >
          Upload screenshot, video, or log file as evidence for this step.
        </p>
        <input
          type="file"
          accept="image/*,video/*,.log,.txt,.har"
          onChange={handleEvidenceUpload}
          style={{ color: 'var(--text-primary)' }}
        />
      </Modal>
    </div>
  );
};

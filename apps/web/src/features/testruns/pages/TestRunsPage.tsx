// File: apps/web/src/features/test-runs/pages/TestRunsPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import {
  Button,
  Badge,
  EmptyState,
  Modal,
  FormField,
  useToast,
  Spinner,
} from '../../../shared/components/ui';

export const TestRunsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();

  const [runs, setRuns] = useState<any[]>([]);
  const [testCases, setTestCases] = useState<any[]>([]); // for picker
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    selectedIds: [] as string[],
  });

  const canCreate =
    user?.role === 'ADMIN' ||
    user?.role === 'DEVELOPER' ||
    user?.role === 'TESTER';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'TESTER';

  const load = () => {
    if (!projectId) return;
    setLoading(true);
    apiClient
      .get(`/api/projects/${projectId}/test-runs`)
      .then((r) => {
        setRuns(r.data.data || r.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Fetch test cases for the picker when modal opens
  const loadTestCases = async () => {
    if (!projectId || testCases.length > 0) return;
    try {
      const r = await apiClient.get(
        `/api/projects/${projectId}/test-cases?limit=100`
      );
      setTestCases(r.data.items || r.data.data || r.data || []);
    } catch {
      /* silently fail — user can still type IDs manually */
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const toggleTestCase = (id: string) => {
    setForm((p) => ({
      ...p,
      selectedIds: p.selectedIds.includes(id)
        ? p.selectedIds.filter((x) => x !== id)
        : [...p.selectedIds, id],
    }));
  };

  const handleCreate = async () => {
    if (!projectId) return;
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (form.selectedIds.length === 0) {
      toast.error('Select at least one test case');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post(`/api/projects/${projectId}/test-runs`, {
        name: form.name,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        testCaseIds: form.selectedIds,
      });
      toast.success('Test run created');
      setCreateModal(false);
      setForm({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        selectedIds: [],
      });
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to create test run');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Added: delete test run
  const handleDelete = async () => {
    if (!deleteTarget || !projectId) return;
    setDeleting(true);
    try {
      await apiClient.delete(
        `/api/projects/${projectId}/test-runs/${deleteTarget.id}`
      );
      toast.success('Test run deleted');
      setDeleteTarget(null);
      setRuns((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete test run');
    } finally {
      setDeleting(false);
    }
  };

  const progressColor = (pct: number) =>
    pct >= 80
      ? 'var(--success)'
      : pct >= 50
        ? 'var(--warning)'
        : 'var(--danger)';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test Runs</h1>
          <p className="page-subtitle">
            {runs.length} test run{runs.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canCreate && (
          <Button
            icon="+"
            onClick={() => {
              setCreateModal(true);
              loadTestCases();
            }}
          >
            New Test Run
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={28} />
        </div>
      ) : runs.length === 0 ? (
        <EmptyState
          icon="▷"
          title="No test runs"
          desc="Create a test run to track execution cycles"
          action={
            canCreate ? (
              <Button
                onClick={() => {
                  setCreateModal(true);
                  loadTestCases();
                }}
              >
                Create Test Run
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {runs.map((run) => {
            const total = run.testCases?.length || run.totalCases || 0;
            const passed =
              run.passed ||
              run.testCases?.filter((t: any) => t.status === 'PASSED')
                ?.length ||
              0;
            const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

            return (
              <div
                key={run.id}
                style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ padding: '16px 20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 6,
                        }}
                      >
                        <button
                          onClick={() =>
                            setExpanded(expanded === run.id ? null : run.id)
                          }
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            padding: 0,
                          }}
                        >
                          {expanded === run.id ? '▼' : '▶'}
                        </button>
                        <span
                          style={{
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                          }}
                        >
                          {run.name}
                        </span>
                        <Badge color="blue">{total} tests</Badge>
                        {run.status && (
                          <Badge
                            color={
                              run.status === 'COMPLETED'
                                ? 'green'
                                : run.status === 'IN_PROGRESS'
                                  ? 'yellow'
                                  : 'gray'
                            }
                          >
                            {run.status?.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      {run.description && (
                        <p
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            marginLeft: 18,
                            marginBottom: 8,
                          }}
                        >
                          {run.description}
                        </p>
                      )}
                      <div style={{ marginLeft: 18 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: 4,
                              background: 'var(--bg-elevated)',
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                height: '100%',
                                width: `${pct}%`,
                                background: progressColor(pct),
                                borderRadius: 2,
                                transition: 'width 0.4s',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--text-muted)',
                              flexShrink: 0,
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 12,
                            fontSize: '0.75rem',
                          }}
                        >
                          {run.startDate && (
                            <span style={{ color: 'var(--text-muted)' }}>
                              Start:{' '}
                              {new Date(run.startDate).toLocaleDateString()}
                            </span>
                          )}
                          {run.endDate && (
                            <span style={{ color: 'var(--text-muted)' }}>
                              End: {new Date(run.endDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          nav(
                            `/projects/${projectId}/reports?tab=exec&testRunId=${run.id}`
                          )
                        }
                      >
                        📊 Report
                      </Button>
                      {(user?.role === 'TESTER' || user?.role === 'ADMIN') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            nav(
                              `/projects/${projectId}/executions?testRunId=${run.id}`
                            )
                          }
                        >
                          ▷ Execute
                        </Button>
                      )}
                      {/* ✅ Added: delete button */}
                      {canDelete && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteTarget(run)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {expanded === run.id && run.testCases?.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                    <table className="tt-table">
                      <thead>
                        <tr>
                          <th>Test Case</th>
                          <th>Status</th>
                          <th>Assigned To</th>
                        </tr>
                      </thead>
                      <tbody>
                        {run.testCases.map((tc: any) => (
                          <tr key={tc.id}>
                            <td style={{ fontWeight: 500 }}>
                              {tc.testCase?.title || tc.title || tc.id}
                            </td>
                            <td>
                              <Badge
                                color={
                                  tc.status === 'PASSED'
                                    ? 'green'
                                    : tc.status === 'FAILED'
                                      ? 'red'
                                      : tc.status === 'BLOCKED'
                                        ? 'yellow'
                                        : 'gray'
                                }
                              >
                                {tc.status || 'PENDING'}
                              </Badge>
                            </td>
                            <td>
                              <span
                                style={{
                                  color: 'var(--text-secondary)',
                                  fontSize: '0.8rem',
                                }}
                              >
                                {tc.assignedTo?.email?.split('@')[0] || '—'}
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

      {/* ✅ Create modal — test case picker instead of manual ID entry */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Test Run"
        size="md"
      >
        <FormField label="Name" required>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Sprint 5 Regression"
          />
        </FormField>
        <FormField label="Description">
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={2}
            style={{ resize: 'vertical' }}
          />
        </FormField>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
          <FormField label="Start Date">
            <input
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, startDate: e.target.value }))
              }
            />
          </FormField>
          <FormField label="End Date">
            <input
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, endDate: e.target.value }))
              }
            />
          </FormField>
        </div>

        {/* ✅ Test case picker — checkboxes instead of manual IDs */}
        <FormField
          label={`Test Cases ${form.selectedIds.length > 0 ? `(${form.selectedIds.length} selected)` : ''}`}
          required
        >
          <div
            style={{
              maxHeight: 220,
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-base)',
            }}
          >
            {testCases.length === 0 ? (
              <div
                style={{
                  padding: 16,
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                  textAlign: 'center',
                }}
              >
                <Spinner size={16} /> Loading test cases...
              </div>
            ) : (
              testCases.map((tc: any) => {
                const selected = form.selectedIds.includes(tc.id);
                return (
                  <div
                    key={tc.id}
                    onClick={() => toggleTestCase(tc.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: selected
                        ? 'rgba(16,185,129,0.06)'
                        : 'transparent',
                      transition: 'background var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      if (!selected)
                        (e.currentTarget as HTMLDivElement).style.background =
                          'rgba(255,255,255,0.03)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        selected ? 'rgba(16,185,129,0.06)' : 'transparent';
                    }}
                  >
                    {/* Checkbox */}
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 4,
                        flexShrink: 0,
                        border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                        background: selected ? 'var(--accent)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all var(--transition)',
                      }}
                    >
                      {selected && (
                        <span
                          style={{
                            color: '#fff',
                            fontSize: '0.6rem',
                            fontWeight: 900,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: 500,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tc.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          gap: 8,
                          marginTop: 1,
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          {tc.testCaseId}
                        </span>
                        <span>·</span>
                        <span>{tc.module}</span>
                        <span>·</span>
                        <span>{tc.priority}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {testCases.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    selectedIds: testCases.map((tc: any) => tc.id),
                  }))
                }
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Select all
              </button>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                ·
              </span>
              <button
                onClick={() => setForm((p) => ({ ...p, selectedIds: [] }))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Clear
              </button>
            </div>
          )}
        </FormField>

        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            marginTop: 16,
          }}
        >
          <Button variant="secondary" onClick={() => setCreateModal(false)}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleCreate}>
            Create Run
          </Button>
        </div>
      </Modal>

      {/* ✅ Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Test Run"
        size="sm"
      >
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: 6,
            fontSize: '0.9rem',
          }}
        >
          Are you sure you want to delete{' '}
          <strong style={{ color: 'var(--text-primary)' }}>
            {deleteTarget?.name}
          </strong>
          ?
        </p>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            marginBottom: 20,
          }}
        >
          This will also remove all execution records linked to this run.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

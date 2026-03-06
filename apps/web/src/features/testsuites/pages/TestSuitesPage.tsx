// File: apps/web/src/features/testsuites/pages/TestSuitesPage.tsx

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import {
  Button,
  Badge,
  StatusBadge,
  EmptyState,
  Modal,
  FormField,
  useToast,
  Spinner,
} from '../../../shared/components/ui';
import { useParams } from 'react-router-dom';

export const TestSuitesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const toast = useToast();

  const [suites, setSuites] = useState<any[]>([]);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addTcModal, setAddTcModal] = useState<string | null>(null);
  const [selectedTcId, setSelectedTcId] = useState('');
  const [execModal, setExecModal] = useState<string | null>(null);
  const [execMode, setExecMode] = useState('SEQUENTIAL');

  const canEdit = user?.role === 'TESTER' || user?.role === 'ADMIN';

  const load = () => {
    if (!projectId) return;
    setLoading(true);
    apiClient
      .get(`/api/projects/${projectId}/test-suites`)
      .then((r) => {
        setSuites(r.data.data || r.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const loadTestCases = async () => {
    if (!projectId || testCases.length > 0) return;
    try {
      const r = await apiClient.get(
        `/api/projects/${projectId}/test-cases?limit=200`
      );
      setTestCases(r.data.items || r.data.data || r.data || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const handleCreate = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await apiClient.post(`/api/projects/${projectId}/test-suites`, form);
      toast.success('Suite created');
      setCreateModal(false);
      setForm({ name: '', description: '' });
      load();
    } catch {
      toast.error('Failed to create suite');
    } finally {
      setSaving(false);
    }
  };

  const handleClone = async (id: string) => {
    try {
      await apiClient.post(
        `/api/projects/${projectId}/test-suites/${id}/clone`
      );
      toast.success('Cloned');
      load();
    } catch {
      toast.error('Failed to clone');
    }
  };

  const handleArchive = async (id: string, archived: boolean) => {
    try {
      await apiClient.patch(
        `/api/projects/${projectId}/test-suites/${id}/${archived ? 'restore' : 'archive'}`
      );
      toast.success(archived ? 'Restored' : 'Archived');
      load();
    } catch {
      toast.error('Failed');
    }
  };

  const handleAddTc = async () => {
    if (!projectId || !addTcModal || !selectedTcId) return;
    try {
      await apiClient.post(
        `/api/projects/${projectId}/test-suites/${addTcModal}/test-cases`,
        { testCaseId: selectedTcId }
      );
      toast.success('Test case added');
      setAddTcModal(null);
      setSelectedTcId('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to add test case');
    }
  };

  const handleRemoveTc = async (suiteId: string, testCaseId: string) => {
    if (!projectId) return;
    try {
      await apiClient.delete(
        `/api/projects/${projectId}/test-suites/${suiteId}/test-cases`,
        { data: { testCaseId } }
      );
      toast.success('Removed');
      load();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleExecute = async () => {
    if (!projectId || !execModal) return;
    try {
      await apiClient.post(
        `/api/projects/${projectId}/test-suites/${execModal}/execute`,
        { executionMode: execMode }
      );
      toast.success('Suite execution started');
      setExecModal(null);
    } catch {
      toast.error('Failed to start execution');
    }
  };

  // Get IDs already in the suite to filter picker
  const getSuiteTestCaseIds = (suiteId: string) => {
    const suite = suites.find((s) => s.id === suiteId);
    return (
      suite?.testCases?.map((tc: any) => tc.testCase?.id || tc.testCaseId) || []
    );
  };

  const priorityColor = (p: string) =>
    p === 'CRITICAL'
      ? 'red'
      : p === 'HIGH'
        ? 'orange'
        : p === 'MEDIUM'
          ? 'yellow'
          : 'gray';

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test Suites</h1>
          <p className="page-subtitle">
            {suites.length} suite{suites.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setCreateModal(true)}>+ New Suite</Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={28} />
        </div>
      ) : suites.length === 0 ? (
        <EmptyState
          icon="⊞"
          title="No test suites"
          desc="Create a suite to group related test cases"
          action={
            canEdit ? (
              <Button onClick={() => setCreateModal(true)}>Create Suite</Button>
            ) : undefined
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {suites.map((suite) => (
            <div
              key={suite.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === suite.id ? null : suite.id)
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
                  {expanded === suite.id ? '▼' : '▶'}
                </button>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{ fontWeight: 600, color: 'var(--text-primary)' }}
                    >
                      {suite.name}
                    </span>
                    {suite.isArchived && <Badge color="gray">Archived</Badge>}
                    <Badge color="blue">
                      {suite.testCases?.length || 0} tests
                    </Badge>
                  </div>
                  {suite.description && (
                    <p
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                    >
                      {suite.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {canEdit && !suite.isArchived && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setExecModal(suite.id)}
                      >
                        ▷ Execute
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setAddTcModal(suite.id);
                          loadTestCases();
                        }}
                      >
                        + Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleClone(suite.id)}
                      >
                        Clone
                      </Button>
                    </>
                  )}
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(suite.id, suite.isArchived)}
                    >
                      {suite.isArchived ? 'Restore' : 'Archive'}
                    </Button>
                  )}
                </div>
              </div>

              {expanded === suite.id && (
                <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  {!suite.testCases?.length ? (
                    <div
                      style={{
                        padding: 20,
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        fontSize: '0.85rem',
                      }}
                    >
                      No test cases yet.
                      {canEdit && (
                        <button
                          onClick={() => {
                            setAddTcModal(suite.id);
                            loadTestCases();
                          }}
                          style={{
                            marginLeft: 8,
                            color: 'var(--accent)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          + Add one
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="tt-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Priority</th>
                          <th>Status</th>
                          {canEdit && <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {suite.testCases.map((tc: any, i: number) => {
                          const testCase = tc.testCase ?? tc;
                          return (
                            <tr key={tc.id}>
                              <td>
                                <span
                                  style={{
                                    color: 'var(--text-muted)',
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {i + 1}
                                </span>
                              </td>
                              <td>
                                <span
                                  style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.72rem',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  {testCase.testCaseId || '—'}
                                </span>
                              </td>
                              <td>
                                <span style={{ fontWeight: 500 }}>
                                  {testCase.title || '—'}
                                </span>
                              </td>
                              <td>
                                {testCase.priority ? (
                                  <Badge
                                    color={
                                      priorityColor(testCase.priority) as any
                                    }
                                  >
                                    {testCase.priority}
                                  </Badge>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td>
                                <StatusBadge value={testCase.status} />
                              </td>
                              {canEdit && (
                                <td style={{ textAlign: 'right' }}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveTc(suite.id, testCase.id)
                                    }
                                    style={{ color: 'var(--danger)' }}
                                  >
                                    Remove
                                  </Button>
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

      {/* Create Suite Modal */}
      <Modal
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Create Test Suite"
        size="sm"
      >
        <FormField label="Name" required>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="e.g. User Authentication Suite"
          />
        </FormField>
        <FormField label="Description">
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
            style={{ resize: 'vertical' }}
          />
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
            Create Suite
          </Button>
        </div>
      </Modal>

      {/* Add Test Case Modal — picker instead of manual ID */}
      <Modal
        open={!!addTcModal}
        onClose={() => {
          setAddTcModal(null);
          setSelectedTcId('');
        }}
        title="Add Test Case to Suite"
        size="md"
      >
        <FormField
          label={`Test Cases${selectedTcId ? ' (1 selected)' : ''}`}
          required
        >
          <div
            style={{
              maxHeight: 300,
              overflowY: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-base)',
            }}
          >
            {testCases.length === 0 ? (
              <div
                style={{
                  padding: 20,
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                }}
              >
                <Spinner size={16} /> Loading...
              </div>
            ) : (
              (() => {
                const alreadyAdded = addTcModal
                  ? getSuiteTestCaseIds(addTcModal)
                  : [];
                const available = testCases.filter(
                  (tc: any) => !alreadyAdded.includes(tc.id)
                );
                return available.length === 0 ? (
                  <div
                    style={{
                      padding: 20,
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '0.82rem',
                    }}
                  >
                    All test cases already added to this suite
                  </div>
                ) : (
                  available.map((tc: any) => {
                    const selected = selectedTcId === tc.id;
                    return (
                      <div
                        key={tc.id}
                        onClick={() => setSelectedTcId(selected ? '' : tc.id)}
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
                      >
                        <div
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            flexShrink: 0,
                            border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                            background: selected
                              ? 'var(--accent)'
                              : 'transparent',
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
                );
              })()
            )}
          </div>
        </FormField>
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            marginTop: 16,
          }}
        >
          <Button
            variant="secondary"
            onClick={() => {
              setAddTcModal(null);
              setSelectedTcId('');
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddTc} disabled={!selectedTcId}>
            Add to Suite
          </Button>
        </div>
      </Modal>

      {/* Execute Modal */}
      <Modal
        open={!!execModal}
        onClose={() => setExecModal(null)}
        title="Execute Suite"
        size="sm"
      >
        <FormField label="Execution Mode">
          <select
            value={execMode}
            onChange={(e) => setExecMode(e.target.value)}
          >
            <option value="SEQUENTIAL">Sequential</option>
            <option value="PARALLEL">Parallel</option>
          </select>
        </FormField>
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            marginTop: 16,
          }}
        >
          <Button variant="secondary" onClick={() => setExecModal(null)}>
            Cancel
          </Button>
          <Button onClick={handleExecute}>Start Execution</Button>
        </div>
      </Modal>
    </div>
  );
};

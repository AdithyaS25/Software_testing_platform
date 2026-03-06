// File: apps/web/src/features/projects/components/ProjectMilestonesTab.tsx
// Self-contained — no longer depends on MilestoneCard or MilestoneFormModal

import { useEffect, useState } from 'react';
import { apiClient } from '../../../lib/axios';
import {
  Button,
  Badge,
  EmptyState,
  Modal,
  FormField,
  useToast,
  Spinner,
} from '../../../shared/components/ui';

interface Props {
  projectId: string;
}

const STATUS_COLOR: Record<string, any> = {
  UPCOMING: 'blue',
  IN_PROGRESS: 'yellow',
  COMPLETED: 'green',
  MISSED: 'red',
};

const STATUS_ICON: Record<string, string> = {
  UPCOMING: '🕐',
  IN_PROGRESS: '⚡',
  COMPLETED: '✅',
  MISSED: '❌',
};

export default function ProjectMilestonesTab({ projectId }: Props) {
  const toast = useToast();

  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const blank = {
    name: '',
    description: '',
    targetDate: '',
    passRateTarget: '',
    status: 'UPCOMING',
  };
  const [form, setForm] = useState(blank);
  const ff = (k: string) => (e: any) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiClient.get(`/api/projects/${projectId}/milestones`);
      setMilestones(r.data.data || r.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const openCreate = () => {
    setForm(blank);
    setEditTarget(null);
    setModal(true);
  };
  const openEdit = (m: any) => {
    setForm({
      name: m.name,
      description: m.description || '',
      targetDate: m.targetDate?.split('T')[0] || '',
      passRateTarget: m.passRateTarget?.toString() || '',
      status: m.status,
    });
    setEditTarget(m);
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.targetDate) {
      toast.error('Name and target date are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        targetDate: form.targetDate,
        status: form.status,
        ...(form.description ? { description: form.description } : {}),
        ...(form.passRateTarget
          ? { passRateTarget: parseFloat(form.passRateTarget) }
          : {}),
      };
      if (editTarget) {
        await apiClient.patch(
          `/api/projects/${projectId}/milestones/${editTarget.id}`,
          payload
        );
        toast.success('Milestone updated');
      } else {
        await apiClient.post(`/api/projects/${projectId}/milestones`, payload);
        toast.success('Milestone created');
      }
      setModal(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(
        `/api/projects/${projectId}/milestones/${deleteTarget}`
      );
      toast.success('Milestone deleted');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const daysUntil = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (diff < 0)
      return { label: `${Math.abs(diff)}d overdue`, color: 'var(--danger)' };
    if (diff === 0) return { label: 'Due today', color: 'var(--warning)' };
    return { label: `${diff}d left`, color: 'var(--text-muted)' };
  };

  // Group by status
  const groups: Record<string, any[]> = {
    IN_PROGRESS: [],
    UPCOMING: [],
    COMPLETED: [],
    MISSED: [],
  };
  milestones.forEach((m) => {
    if (groups[m.status]) groups[m.status].push(m);
  });
  const orderedStatuses = ['IN_PROGRESS', 'UPCOMING', 'COMPLETED', 'MISSED'];

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spinner size={28} />
      </div>
    );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 2,
            }}
          >
            Milestones
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {milestones.length} milestone{milestones.length !== 1 ? 's' : ''}{' '}
            total
          </p>
        </div>
        <Button onClick={openCreate} icon="+">
          Add Milestone
        </Button>
      </div>

      {milestones.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No milestones yet"
          desc="Define milestones to track your release targets and pass rate goals"
          action={<Button onClick={openCreate}>Create Milestone</Button>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {orderedStatuses.map((status) => {
            const group = groups[status];
            if (!group.length) return null;
            return (
              <div key={status}>
                {/* Group header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>
                    {STATUS_ICON[status]}
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {status.replace('_', ' ')}
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 7px',
                      borderRadius: '100px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {group.length}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: 'var(--border-subtle)',
                    }}
                  />
                </div>

                {/* Milestone cards */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 14,
                  }}
                >
                  {group.map((m) => {
                    const due = m.targetDate ? daysUntil(m.targetDate) : null;
                    const progress = m.progress;
                    const passRate = progress?.averagePassRate ?? 0;
                    const target = m.passRateTarget ?? null;
                    const barWidth = target
                      ? Math.min(100, (passRate / target) * 100)
                      : 0;

                    return (
                      <div
                        key={m.id}
                        style={{
                          background: 'rgba(255,255,255,0.025)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: 'var(--radius-lg)',
                          padding: '18px 20px',
                          backdropFilter: 'blur(12px)',
                          transition: 'all var(--transition)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = 'rgba(255,255,255,0.14)';
                          (e.currentTarget as HTMLDivElement).style.transform =
                            'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLDivElement
                          ).style.borderColor = 'var(--border-glass)';
                          (e.currentTarget as HTMLDivElement).style.transform =
                            '';
                        }}
                      >
                        {/* Top row */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 10,
                            marginBottom: 10,
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 4,
                                flexWrap: 'wrap',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 700,
                                  fontSize: '0.9rem',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {m.name}
                              </span>
                              <Badge color={STATUS_COLOR[m.status] ?? 'gray'}>
                                {m.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {m.description && (
                              <p
                                style={{
                                  fontSize: '0.78rem',
                                  color: 'var(--text-muted)',
                                  lineHeight: 1.5,
                                }}
                              >
                                {m.description}
                              </p>
                            )}
                          </div>
                          {/* Action buttons — properly separated */}
                          <div
                            style={{ display: 'flex', gap: 6, flexShrink: 0 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEdit(m)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setDeleteTarget(m.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Meta row */}
                        <div
                          style={{
                            display: 'flex',
                            gap: 14,
                            fontSize: '0.75rem',
                            flexWrap: 'wrap',
                            marginBottom: target ? 14 : 0,
                          }}
                        >
                          {m.targetDate && (
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                color: 'var(--text-muted)',
                              }}
                            >
                              📅{' '}
                              {new Date(m.targetDate).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }
                              )}
                              {due && (
                                <span
                                  style={{ color: due.color, fontWeight: 600 }}
                                >
                                  · {due.label}
                                </span>
                              )}
                            </span>
                          )}
                          {m.testRuns?.length > 0 && (
                            <span
                              style={{
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              ▷ {m.testRuns.length} run
                              {m.testRuns.length !== 1 ? 's' : ''} linked
                            </span>
                          )}
                          {target != null && (
                            <span
                              style={{
                                color: 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              🎯 {target}% target
                            </span>
                          )}
                        </div>

                        {/* Pass rate progress bar */}
                        {target != null && (
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: 6,
                                fontSize: '0.72rem',
                              }}
                            >
                              <span style={{ color: 'var(--text-muted)' }}>
                                Pass Rate
                              </span>
                              <span
                                style={{
                                  color:
                                    passRate >= target
                                      ? 'var(--success)'
                                      : 'var(--text-secondary)',
                                  fontWeight: 600,
                                }}
                              >
                                {passRate.toFixed(1)}% / {target}%
                              </span>
                            </div>
                            <div
                              style={{
                                height: 4,
                                borderRadius: 100,
                                background: 'rgba(255,255,255,0.06)',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${barWidth}%`,
                                  borderRadius: 100,
                                  background:
                                    passRate >= target
                                      ? 'linear-gradient(90deg, var(--success), var(--accent))'
                                      : 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                                  boxShadow: '0 0 8px var(--accent-glow)',
                                  transition: 'width 0.6s ease',
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editTarget ? 'Edit Milestone' : 'New Milestone'}
        size="md"
      >
        <FormField label="Name" required>
          <input
            value={form.name}
            onChange={ff('name')}
            placeholder="e.g. Beta Release"
          />
        </FormField>
        <FormField label="Description">
          <textarea
            value={form.description}
            onChange={ff('description')}
            rows={2}
            style={{ resize: 'vertical' }}
            placeholder="What does this milestone represent?"
          />
        </FormField>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
          <FormField label="Target Date" required>
            <input
              type="date"
              value={form.targetDate}
              onChange={ff('targetDate')}
            />
          </FormField>
          <FormField label="Pass Rate Target (%)">
            <input
              type="number"
              value={form.passRateTarget}
              onChange={ff('passRateTarget')}
              placeholder="e.g. 95"
              min={0}
              max={100}
              step={0.1}
            />
          </FormField>
        </div>
        <FormField label="Status">
          <select value={form.status} onChange={ff('status')}>
            {['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'MISSED'].map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
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
          <Button variant="secondary" onClick={() => setModal(false)}>
            Cancel
          </Button>
          <Button loading={saving} onClick={handleSave}>
            {editTarget ? 'Update' : 'Create'} Milestone
          </Button>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Milestone"
        size="sm"
      >
        <p
          style={{
            color: 'var(--text-secondary)',
            marginBottom: 20,
            fontSize: '0.9rem',
          }}
        >
          Are you sure you want to delete this milestone? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

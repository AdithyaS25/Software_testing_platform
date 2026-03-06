import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';
import {
  Button,
  FormField,
  useToast,
  Select,
} from '../../../shared/components/ui';

interface Member {
  user: { id: string; email: string; role: string };
}

export const CreateBugPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const nav = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    severity: 'MAJOR',
    priority: 'P3_MEDIUM',
    environment: '',
    affectedVersion: '',
    assignedToId: '',
  });

  useEffect(() => {
    if (!projectId) return;
    apiClient
      .get(`/api/projects/${projectId}/members`)
      .then((r) => setMembers(r.data?.data ?? []))
      .catch(() => {});
  }, [projectId]);

  const setField = (k: string) => (e: any) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setLoading(true);
    try {
      const payload: Record<string, any> = { ...form };
      if (!payload.assignedToId) delete payload.assignedToId;
      await apiClient.post(`/api/projects/${projectId}/bugs`, payload);
      toast.success('Bug created successfully');
      nav(`/projects/${projectId}/bugs`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create bug');
    } finally {
      setLoading(false);
    }
  };

  // Bugs should be assigned to Developers only
  const developerOptions = members
    .filter((m) => m.user.role === 'DEVELOPER')
    .map((m) => ({
      value: m.user.id,
      label: m.user.email.split('@')[0],
    }));

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Bug</h1>
          <p className="page-subtitle">Report a new defect in this project</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 16,
          }}
        >
          <FormField label="Title" required>
            <input value={form.title} onChange={setField('title')} required />
          </FormField>

          <FormField label="Description" required>
            <textarea
              value={form.description}
              onChange={setField('description')}
              rows={3}
              required
            />
          </FormField>

          <FormField label="Steps to Reproduce">
            <textarea
              value={form.stepsToReproduce}
              onChange={setField('stepsToReproduce')}
              rows={3}
            />
          </FormField>

          <FormField label="Expected Behavior">
            <textarea
              value={form.expectedBehavior}
              onChange={setField('expectedBehavior')}
              rows={2}
            />
          </FormField>

          <FormField label="Actual Behavior">
            <textarea
              value={form.actualBehavior}
              onChange={setField('actualBehavior')}
              rows={2}
            />
          </FormField>

          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
          >
            <FormField label="Severity" required>
              <select value={form.severity} onChange={setField('severity')}>
                {['BLOCKER', 'CRITICAL', 'MAJOR', 'MINOR', 'TRIVIAL'].map(
                  (v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  )
                )}
              </select>
            </FormField>
            <FormField label="Priority" required>
              <select value={form.priority} onChange={setField('priority')}>
                <option value="P1_URGENT">P1 Urgent</option>
                <option value="P2_HIGH">P2 High</option>
                <option value="P3_MEDIUM">P3 Medium</option>
                <option value="P4_LOW">P4 Low</option>
              </select>
            </FormField>
          </div>

          <FormField label="Environment">
            <input
              value={form.environment}
              onChange={setField('environment')}
            />
          </FormField>

          <FormField label="Affected Version">
            <input
              value={form.affectedVersion}
              onChange={setField('affectedVersion')}
            />
          </FormField>

          <FormField label="Assign To Developer">
            {developerOptions.length === 0 ? (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                }}
              >
                No developers in this project — add one via Project → Members
              </div>
            ) : (
              <Select
                value={form.assignedToId}
                onChange={(v) => setForm((p) => ({ ...p, assignedToId: v }))}
                placeholder="Unassigned"
                options={developerOptions}
              />
            )}
          </FormField>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => nav(`/projects/${projectId}/bugs`)}
          >
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Create Bug
          </Button>
        </div>
      </form>
    </div>
  );
};

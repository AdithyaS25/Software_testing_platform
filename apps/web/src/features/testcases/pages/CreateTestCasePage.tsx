import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';
import {
  Button,
  FormField,
  useToast,
  Select,
} from '../../../shared/components/ui';

interface Step {
  stepNumber: number;
  action: string;
  expectedResult: string;
  testData?: string;
}

interface Member {
  user: { id: string; email: string; role: string };
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div style={{ marginBottom: 28 }}>
    <h3
      style={{
        fontSize: '0.8rem',
        fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 14,
        paddingBottom: 8,
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
    {children}
  </div>
);

export const CreateTestCasePage = () => {
  const nav = useNavigate();
  const toast = useToast();
  const { projectId } = useParams<{ projectId: string }>();

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    module: '',
    priority: 'MEDIUM',
    severity: 'MAJOR',
    type: 'FUNCTIONAL',
    status: 'DRAFT',
    automationStatus: 'NOT_AUTOMATED',
    tags: '',
    preConditions: '',
    testDataRequirements: '',
    environmentRequirements: '',
    postConditions: '',
    cleanupSteps: '',
    estimatedDuration: '',
    automationScriptLink: '',
    assignedToId: '',
  });

  const [steps, setSteps] = useState<Step[]>([
    { stepNumber: 1, action: '', expectedResult: '', testData: '' },
  ]);

  useEffect(() => {
    if (!projectId) return;
    apiClient
      .get(`/api/projects/${projectId}/members`)
      .then((r) => setMembers(r.data?.data ?? []))
      .catch(() => {});
  }, [projectId]);

  const setField =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const addStep = () =>
    setSteps((p) => [
      ...p,
      {
        stepNumber: p.length + 1,
        action: '',
        expectedResult: '',
        testData: '',
      },
    ]);

  const removeStep = (i: number) =>
    setSteps((p) =>
      p
        .filter((_, idx) => idx !== i)
        .map((s, idx) => ({ ...s, stepNumber: idx + 1 }))
    );

  const setStep =
    (i: number, k: keyof Step) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setSteps((p) =>
        p.map((s, idx) => (idx === i ? { ...s, [k]: e.target.value } : s))
      );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      toast.error('No project selected');
      return;
    }

    // ── Frontend validation ──────────────────────────────────
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!form.module.trim()) {
      toast.error('Module / Feature is required');
      return;
    }

    const validSteps = steps.filter(
      (s) => s.action.trim() && s.expectedResult.trim()
    );
    if (validSteps.length === 0) {
      toast.error(
        'At least one complete step (action + expected result) is required'
      );
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        title: form.title.trim(),
        description: form.description.trim(),
        module: form.module.trim(),
        priority: form.priority,
        severity: form.severity,
        type: form.type,
        status: form.status,
        automationStatus: form.automationStatus,
        steps: validSteps.map((s) => ({
          stepNumber: s.stepNumber,
          action: s.action.trim(),
          expectedResult: s.expectedResult.trim(),
          ...(s.testData?.trim() && { testData: s.testData.trim() }),
        })),
        ...(form.tags.trim() && {
          tags: form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
        ...(form.preConditions.trim() && {
          preConditions: form.preConditions.trim(),
        }),
        ...(form.testDataRequirements.trim() && {
          testDataRequirements: form.testDataRequirements.trim(),
        }),
        ...(form.environmentRequirements.trim() && {
          environmentRequirements: form.environmentRequirements.trim(),
        }),
        ...(form.postConditions.trim() && {
          postConditions: form.postConditions.trim(),
        }),
        ...(form.cleanupSteps.trim() && {
          cleanupSteps: form.cleanupSteps.trim(),
        }),
        ...(form.estimatedDuration && {
          estimatedDuration: parseInt(form.estimatedDuration),
        }),
        ...(form.automationScriptLink.trim() && {
          automationScriptLink: form.automationScriptLink.trim(),
        }),
        ...(form.assignedToId && { assignedToId: form.assignedToId }),
      };

      await apiClient.post(`/api/projects/${projectId}/test-cases`, payload);
      toast.success('Test case created successfully!');
      nav(`/projects/${projectId}/test-cases`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create test case');
    } finally {
      setLoading(false);
    }
  };

  // Test cases assigned to Testers only
  const testerOptions = members
    .filter((m) => m.user.role === 'TESTER')
    .map((m) => ({
      value: m.user.id,
      label: m.user.email.split('@')[0],
    }));

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', maxWidth: 900 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Test Case</h1>
          <p className="page-subtitle">
            Define a new test case with steps and metadata
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="secondary"
            onClick={() => nav(`/projects/${projectId}/test-cases`)}
          >
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Save Test Case
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 16,
          }}
        >
          <Section title="Basic Information">
            <FormField label="Title" required>
              <input
                value={form.title}
                onChange={setField('title')}
                placeholder="e.g. Verify user login with valid credentials"
                required
                maxLength={200}
              />
            </FormField>
            <FormField label="Description" required>
              <textarea
                value={form.description}
                onChange={setField('description')}
                placeholder="Detailed description of what is being tested..."
                rows={3}
                style={{ resize: 'vertical' }}
                required
              />
            </FormField>
            <Row>
              <FormField label="Module / Feature" required>
                <input
                  value={form.module}
                  onChange={setField('module')}
                  placeholder="Authentication, User Management..."
                  required
                />
              </FormField>
              <FormField label="Tags">
                <input
                  value={form.tags}
                  onChange={setField('tags')}
                  placeholder="login, smoke, P1 (comma separated)"
                />
              </FormField>
            </Row>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 12,
              }}
            >
              <FormField label="Priority" required>
                <select value={form.priority} onChange={setField('priority')}>
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </FormField>
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
              <FormField label="Type" required>
                <select value={form.type} onChange={setField('type')}>
                  {[
                    'FUNCTIONAL',
                    'REGRESSION',
                    'SMOKE',
                    'INTEGRATION',
                    'UAT',
                    'PERFORMANCE',
                    'SECURITY',
                    'USABILITY',
                  ].map((v) => (
                    <option key={v} value={v}>
                      {v.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Status" required>
                <select value={form.status} onChange={setField('status')}>
                  {[
                    'DRAFT',
                    'READY_FOR_REVIEW',
                    'APPROVED',
                    'DEPRECATED',
                    'ARCHIVED',
                  ].map((v) => (
                    <option key={v} value={v}>
                      {v.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Assign To Tester */}
            <FormField label="Assign To Tester">
              {testerOptions.length === 0 ? (
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
                  No testers in this project — add one via Project → Members
                </div>
              ) : (
                <Select
                  value={form.assignedToId}
                  onChange={(v) => setForm((p) => ({ ...p, assignedToId: v }))}
                  placeholder="Unassigned"
                  options={testerOptions}
                />
              )}
            </FormField>
          </Section>
        </div>

        {/* Pre-conditions */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 16,
          }}
        >
          <Section title="Pre-conditions">
            <FormField label="Pre-conditions">
              <textarea
                value={form.preConditions}
                onChange={setField('preConditions')}
                placeholder="Conditions that must be true before test execution..."
                rows={2}
                style={{ resize: 'vertical' }}
              />
            </FormField>
            <Row>
              <FormField label="Test Data Requirements">
                <textarea
                  value={form.testDataRequirements}
                  onChange={setField('testDataRequirements')}
                  placeholder="Specific data needed for testing..."
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </FormField>
              <FormField label="Environment Requirements">
                <textarea
                  value={form.environmentRequirements}
                  onChange={setField('environmentRequirements')}
                  placeholder="Browser, OS, network requirements..."
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </FormField>
            </Row>
          </Section>
        </div>

        {/* Test Steps */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
              paddingBottom: 8,
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <h3
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Test Steps
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={addStep}
              type="button"
            >
              + Add Step
            </Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: 'var(--accent-muted)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {step.stepNumber}
                    </span>
                    <span
                      style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}
                    >
                      Step {step.stepNumber}
                    </span>
                  </div>
                  {steps.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(i)}
                      type="button"
                      style={{ color: 'var(--danger)' }}
                    >
                      ✕
                    </Button>
                  )}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <FormField label="Action" required>
                    <textarea
                      value={step.action}
                      onChange={setStep(i, 'action')}
                      placeholder="What the tester should do..."
                      rows={2}
                      style={{ resize: 'vertical' }}
                      required
                    />
                  </FormField>
                  <FormField label="Expected Result" required>
                    <textarea
                      value={step.expectedResult}
                      onChange={setStep(i, 'expectedResult')}
                      placeholder="What should happen..."
                      rows={2}
                      style={{ resize: 'vertical' }}
                      required
                    />
                  </FormField>
                  <FormField label="Test Data">
                    <input
                      value={step.testData || ''}
                      onChange={setStep(i, 'testData')}
                      placeholder="Specific data for this step..."
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Post-conditions & Metadata */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            marginBottom: 16,
          }}
        >
          <Section title="Post-conditions & Metadata">
            <Row>
              <FormField label="Post-conditions">
                <textarea
                  value={form.postConditions}
                  onChange={setField('postConditions')}
                  placeholder="System state after test completion..."
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </FormField>
              <FormField label="Cleanup Steps">
                <textarea
                  value={form.cleanupSteps}
                  onChange={setField('cleanupSteps')}
                  placeholder="Actions to reset system state..."
                  rows={2}
                  style={{ resize: 'vertical' }}
                />
              </FormField>
            </Row>
            <Row>
              <FormField label="Automation Status">
                <select
                  value={form.automationStatus}
                  onChange={setField('automationStatus')}
                >
                  {[
                    'NOT_AUTOMATED',
                    'IN_PROGRESS',
                    'AUTOMATED',
                    'CANNOT_AUTOMATE',
                  ].map((v) => (
                    <option key={v} value={v}>
                      {v.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Estimated Duration (minutes)">
                <input
                  type="number"
                  value={form.estimatedDuration}
                  onChange={setField('estimatedDuration')}
                  placeholder="e.g. 5"
                  min={1}
                />
              </FormField>
            </Row>
            <FormField label="Automation Script Link">
              <input
                value={form.automationScriptLink}
                onChange={setField('automationScriptLink')}
                placeholder="https://github.com/repo/tests/..."
              />
            </FormField>
          </Section>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'flex-end',
            paddingTop: 8,
          }}
        >
          <Button
            variant="secondary"
            onClick={() => nav(`/projects/${projectId}/test-cases`)}
            type="button"
          >
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Save Test Case
          </Button>
        </div>
      </form>
    </div>
  );
};

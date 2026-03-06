// File: apps/web/src/features/projects/components/ProjectSettingsTab.tsx

import { useState } from 'react';
import { projectApi } from '../api/projectApi';
import type {
  Project,
  ProjectEnvironment,
  ProjectCustomField,
} from '../types/project.types';

// String literals instead of enum references (verbatimModuleSyntax safe)
type CustomFieldType = 'TEXT' | 'NUMBER' | 'DROPDOWN' | 'DATE' | 'BOOLEAN';

interface Props {
  project: Project;
  onUpdated: () => void;
}

export default function ProjectSettingsTab({ project, onUpdated }: Props) {
  // ── General Info ─────────────────────────────────────────────────
  const [info, setInfo] = useState({
    name: project.name,
    description: project.description ?? '',
  });
  const [savingInfo, setSavingInfo] = useState(false);

  const handleSaveInfo = async () => {
    try {
      setSavingInfo(true);
      await projectApi.update(project.id, {
        name: info.name,
        description: info.description,
      });
      onUpdated();
    } finally {
      setSavingInfo(false);
    }
  };

  // ── Environments ──────────────────────────────────────────────────
  const [envForm, setEnvForm] = useState({ name: '', url: '' });
  const [savingEnv, setSavingEnv] = useState(false);

  const handleAddEnv = async () => {
    if (!envForm.name.trim()) return;
    try {
      setSavingEnv(true);
      await projectApi.createEnvironment(project.id, {
        name: envForm.name.trim(),
        url: envForm.url.trim() || undefined,
      });
      setEnvForm({ name: '', url: '' });
      onUpdated();
    } finally {
      setSavingEnv(false);
    }
  };

  const handleDeleteEnv = async (envId: string) => {
    if (!confirm('Delete this environment?')) return;
    await projectApi.deleteEnvironment(project.id, envId);
    onUpdated();
  };

  // ── Custom Fields ─────────────────────────────────────────────────
  const [fieldForm, setFieldForm] = useState<{
    name: string;
    fieldType: CustomFieldType;
    options: string;
    required: boolean;
  }>({ name: '', fieldType: 'TEXT', options: '', required: false });
  const [savingField, setSavingField] = useState(false);

  const handleAddField = async () => {
    if (!fieldForm.name.trim()) return;
    try {
      setSavingField(true);
      await projectApi.createCustomField(project.id, {
        name: fieldForm.name.trim(),
        fieldType: fieldForm.fieldType,
        options:
          fieldForm.fieldType === 'DROPDOWN'
            ? fieldForm.options
                .split(',')
                .map((o) => o.trim())
                .filter(Boolean)
            : [],
        required: fieldForm.required,
      });
      setFieldForm({
        name: '',
        fieldType: 'TEXT',
        options: '',
        required: false,
      });
      onUpdated();
    } finally {
      setSavingField(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Delete this custom field?')) return;
    await projectApi.deleteCustomField(project.id, fieldId);
    onUpdated();
  };

  // ── Archive ───────────────────────────────────────────────────────
  const handleArchive = async () => {
    if (!confirm('Archive this project? It will be hidden but not deleted.'))
      return;
    await projectApi.update(project.id, { status: 'ARCHIVED' });
    onUpdated();
  };

  // ── Styles ────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    marginBottom: 16,
  };
  const label: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: 5,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };
  const sectionTitle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 4,
  };
  const btn = (
    variant: 'primary' | 'danger' = 'primary'
  ): React.CSSProperties => ({
    padding: '7px 16px',
    fontSize: '0.85rem',
    fontWeight: 500,
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    cursor: 'pointer',
    fontFamily: 'var(--font-sans)',
    ...(variant === 'primary'
      ? {
          background: 'var(--accent)',
          borderColor: 'var(--accent)',
          color: '#fff',
        }
      : {
          background: 'var(--danger-muted)',
          borderColor: 'rgba(255,77,106,0.3)',
          color: 'var(--danger)',
        }),
  });

  return (
    <div style={{ maxWidth: 640 }}>
      {/* General Info */}
      <div style={card}>
        <p style={sectionTitle}>General Information</p>
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: 14,
          }}
        >
          Update the project name and description.
        </p>
        <div style={{ marginBottom: 12 }}>
          <label style={label}>Project Name</label>
          <input
            value={info.name}
            onChange={(e) => setInfo((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={label}>Description</label>
          <textarea
            value={info.description}
            onChange={(e) =>
              setInfo((p) => ({ ...p, description: e.target.value }))
            }
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>
        <button style={btn()} onClick={handleSaveInfo} disabled={savingInfo}>
          {savingInfo ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Environments */}
      <div style={card}>
        <p style={sectionTitle}>Environments</p>
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: 14,
          }}
        >
          Define environments like Staging, Production, QA.
        </p>
        <div style={{ marginBottom: 12 }}>
          {(project.environments ?? []).length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No environments yet.
            </p>
          ) : (
            (project.environments ?? []).map((env: ProjectEnvironment) => (
              <div
                key={env.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                  }}
                >
                  {env.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
                  >
                    {env.url || '—'}
                  </span>
                  <button
                    style={{
                      ...btn('danger'),
                      padding: '3px 10px',
                      fontSize: '0.75rem',
                    }}
                    onClick={() => handleDeleteEnv(env.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={envForm.name}
            onChange={(e) =>
              setEnvForm((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Name (e.g. Staging)"
            style={{ flex: 1 }}
          />
          <input
            value={envForm.url}
            onChange={(e) => setEnvForm((p) => ({ ...p, url: e.target.value }))}
            placeholder="URL (optional)"
            style={{ flex: 1 }}
          />
          <button style={btn()} onClick={handleAddEnv} disabled={savingEnv}>
            {savingEnv ? '...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Custom Fields */}
      <div style={card}>
        <p style={sectionTitle}>Custom Fields</p>
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: 14,
          }}
        >
          Project-specific fields shown on test cases and bugs.
        </p>
        <div style={{ marginBottom: 12 }}>
          {(project.customFields ?? []).length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No custom fields yet.
            </p>
          ) : (
            (project.customFields ?? []).map((field: ProjectCustomField) => (
              <div
                key={field.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {field.name}
                  </span>
                  <span
                    style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
                  >
                    {field.fieldType}
                  </span>
                  {field.required && (
                    <span
                      style={{ fontSize: '0.72rem', color: 'var(--danger)' }}
                    >
                      Required
                    </span>
                  )}
                </div>
                <button
                  style={{
                    ...btn('danger'),
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                  }}
                  onClick={() => handleDeleteField(field.id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <input
            value={fieldForm.name}
            onChange={(e) =>
              setFieldForm((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Field name"
          />
          <select
            value={fieldForm.fieldType}
            onChange={(e) =>
              setFieldForm((p) => ({
                ...p,
                fieldType: e.target.value as CustomFieldType,
              }))
            }
          >
            <option value="TEXT">Text</option>
            <option value="NUMBER">Number</option>
            <option value="DROPDOWN">Dropdown</option>
            <option value="DATE">Date</option>
            <option value="BOOLEAN">Boolean</option>
          </select>
          {fieldForm.fieldType === 'DROPDOWN' && (
            <input
              value={fieldForm.options}
              onChange={(e) =>
                setFieldForm((p) => ({ ...p, options: e.target.value }))
              }
              placeholder="Options (comma-separated)"
              style={{ gridColumn: '1 / -1' }}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={fieldForm.required}
              onChange={(e) =>
                setFieldForm((p) => ({ ...p, required: e.target.checked }))
              }
            />
            Required field
          </label>
          <button style={btn()} onClick={handleAddField} disabled={savingField}>
            {savingField ? 'Adding...' : 'Add Field'}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      {project.status !== 'ARCHIVED' && (
        <div style={{ ...card, border: '1px solid rgba(255,77,106,0.3)' }}>
          <p style={{ ...sectionTitle, color: 'var(--danger)' }}>Danger Zone</p>
          <p
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              marginBottom: 14,
            }}
          >
            Archiving hides this project from the list. All data is retained.
          </p>
          <button style={btn('danger')} onClick={handleArchive}>
            Archive Project
          </button>
        </div>
      )}
    </div>
  );
}

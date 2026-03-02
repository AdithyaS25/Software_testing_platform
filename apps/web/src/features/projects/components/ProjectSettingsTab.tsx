// File: apps/web/src/features/projects/components/ProjectSettingsTab.tsx

import { useState } from 'react';
import { projectApi } from '../api/projectApi';
import {
  type Project,
  type ProjectEnvironment,
  type ProjectCustomField,
  CustomFieldType,
  ProjectStatus,
} from '../types/project.types';

interface Props {
  project: Project;
  onUpdated: () => void;
}

export default function ProjectSettingsTab({ project, onUpdated }: Props) {
  // ─── General Info ────────────────────────────────────────
  const [info, setInfo] = useState({ name: project.name, description: project.description ?? '' });
  const [savingInfo, setSavingInfo] = useState(false);

  const handleSaveInfo = async () => {
    try {
      setSavingInfo(true);
      await projectApi.update(project.id, { name: info.name, description: info.description });
      onUpdated();
    } finally {
      setSavingInfo(false);
    }
  };

  // ─── Environments ─────────────────────────────────────────
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

  // ─── Custom Fields ────────────────────────────────────────
  const [fieldForm, setFieldForm] = useState<{
    name: string;
    fieldType: CustomFieldType;
    options: string;
    required: boolean;
  }>({ name: '', fieldType: CustomFieldType.TEXT, options: '', required: false });
  const [savingField, setSavingField] = useState(false);

  const handleAddField = async () => {
    if (!fieldForm.name.trim()) return;
    try {
      setSavingField(true);
      await projectApi.createCustomField(project.id, {
        name: fieldForm.name.trim(),
        fieldType: fieldForm.fieldType,
        options:
          fieldForm.fieldType === CustomFieldType.DROPDOWN
            ? fieldForm.options.split(',').map((o) => o.trim()).filter(Boolean)
            : [],
        required: fieldForm.required,
      });
      setFieldForm({ name: '', fieldType: CustomFieldType.TEXT, options: '', required: false });
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

  // ─── Archive ─────────────────────────────────────────────
  const handleArchive = async () => {
    if (!confirm('Archive this project? It will be hidden but not deleted.')) return;
    await projectApi.update(project.id, { status: ProjectStatus.ARCHIVED });
    onUpdated();
  };

  return (
    <div className="max-w-2xl space-y-8">
      {/* General Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">General Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => setInfo((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={info.description}
              onChange={(e) => setInfo((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleSaveInfo}
            disabled={savingInfo}
            className="bg-indigo-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {savingInfo ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </section>

      {/* Environments */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Environments</h3>
        <div className="space-y-2 mb-4">
          {(project.environments ?? []).length === 0 && (
            <p className="text-sm text-gray-400">No environments yet.</p>
          )}
          {(project.environments ?? []).map((env: ProjectEnvironment) => (
            <div key={env.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm">
              <span className="font-medium text-gray-700">{env.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">{env.url || '—'}</span>
                <button
                  onClick={() => handleDeleteEnv(env.id)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={envForm.name}
            onChange={(e) => setEnvForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Environment name (e.g. Staging)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={envForm.url}
            onChange={(e) => setEnvForm((p) => ({ ...p, url: e.target.value }))}
            placeholder="URL (optional)"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddEnv}
            disabled={savingEnv}
            className="bg-indigo-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            Add
          </button>
        </div>
      </section>

      {/* Custom Fields */}
      <section className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-1">Custom Fields</h3>
        <p className="text-xs text-gray-400 mb-4">
          Project-specific fields shown on test cases and bugs in this project.
        </p>
        <div className="space-y-2 mb-4">
          {(project.customFields ?? []).length === 0 && (
            <p className="text-sm text-gray-400">No custom fields yet.</p>
          )}
          {(project.customFields ?? []).map((field: ProjectCustomField) => (
            <div
              key={field.id}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-gray-700">{field.name}</span>
                <span className="ml-2 text-xs text-gray-400">{field.fieldType}</span>
                {field.required && <span className="ml-2 text-xs text-red-400">Required</span>}
              </div>
              <button
                onClick={() => handleDeleteField(field.id)}
                className="text-red-400 hover:text-red-600 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={fieldForm.name}
            onChange={(e) => setFieldForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Field name"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={fieldForm.fieldType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFieldForm((p) => ({ ...p, fieldType: e.target.value as CustomFieldType }))
            }
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={CustomFieldType.TEXT}>Text</option>
            <option value={CustomFieldType.NUMBER}>Number</option>
            <option value={CustomFieldType.DROPDOWN}>Dropdown</option>
            <option value={CustomFieldType.DATE}>Date</option>
            <option value={CustomFieldType.BOOLEAN}>Boolean</option>
          </select>
          {fieldForm.fieldType === CustomFieldType.DROPDOWN && (
            <input
              type="text"
              value={fieldForm.options}
              onChange={(e) => setFieldForm((p) => ({ ...p, options: e.target.value }))}
              placeholder="Options (comma-separated)"
              className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={fieldForm.required}
              onChange={(e) => setFieldForm((p) => ({ ...p, required: e.target.checked }))}
              className="accent-indigo-600"
            />
            Required field
          </label>
          <button
            onClick={handleAddField}
            disabled={savingField}
            className="bg-indigo-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {savingField ? 'Adding...' : 'Add Field'}
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      {project.status !== ProjectStatus.ARCHIVED && (
        <section className="bg-white rounded-xl border border-red-200 p-5">
          <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-4">
            Archiving this project will hide it from the projects list. All data is retained.
          </p>
          <button
            onClick={handleArchive}
            className="bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700"
          >
            Archive Project
          </button>
        </section>
      )}
    </div>
  );
}

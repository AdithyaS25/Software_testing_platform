// File: apps/web/src/features/projects/components/CreateProjectModal.tsx

import { useState } from 'react';
import { projectApi } from '../api/projectApi';
import type { Project } from '../types/project.types';

interface Props {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

export default function CreateProjectModal({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: '', description: '', key: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Auto-generate key from name
  const handleNameChange = (name: string) => {
    const key = name
      .toUpperCase()
      .replace(/[^A-Z\s]/g, '')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .join('')
      .slice(0, 6);
    setForm((prev) => ({ ...prev, name, key: prev.key || key }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^[A-Z]{2,6}$/.test(form.key))
      errs.key = 'Key must be 2–6 uppercase letters';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      setLoading(true);
      const project = await projectApi.create({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        key: form.key,
      });
      onCreated(project);
    } catch (err: any) {
      setErrors({ general: err?.response?.data?.message ?? 'Failed to create project' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Create Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {errors.general && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
            {errors.general}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Mobile App v2.0"
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.key}
              onChange={(e) => setForm((p) => ({ ...p, key: e.target.value.toUpperCase() }))}
              placeholder="e.g. MAV"
              maxLength={6}
              className={`w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.key ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.key ? (
              <p className="text-xs text-red-500 mt-1">{errors.key}</p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">2–6 uppercase letters. Used as prefix for IDs.</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="What is this project about?"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

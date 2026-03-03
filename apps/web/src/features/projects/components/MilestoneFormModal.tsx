// File: apps/web/src/features/projects/components/MilestoneFormModal.tsx

import { useEffect, useState } from 'react';
import { projectApi } from '../api/projectApi';
import type { Milestone } from '../types/project.types';
import { apiClient } from '../../../lib/axios';

interface Props {
  projectId: string;
  milestone: Milestone | null;
  onClose: () => void;
  onSaved: () => void;
}

interface TestRunOption {
  id: string;
  name: string;
  status: string;
}

export default function MilestoneFormModal({ projectId, milestone, onClose, onSaved }: Props) {
  const isEdit = !!milestone;
  const [form, setForm] = useState({
    name: milestone?.name ?? '',
    description: milestone?.description ?? '',
    targetDate: milestone?.targetDate
      ? new Date(milestone.targetDate).toISOString().split('T')[0]
      : '',
    passRateTarget: milestone?.passRateTarget?.toString() ?? '',
    status: milestone?.status ?? 'UPCOMING',
  });
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>(
    milestone?.testRuns?.map((r) => r.testRunId) ?? []
  );
  const [testRunOptions, setTestRunOptions] = useState<TestRunOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch test runs for this project
    apiClient
  .get(`/api/test-runs?projectId=${projectId}`)
  .then(({ data }: { data: { data: TestRunOption[] } }) => setTestRunOptions(data.data ?? []))
  .catch(() => {});
  }, [projectId]);

  const toggleRun = (id: string) => {
    setSelectedRunIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('Name is required'); return; }
    if (!form.targetDate) { setError('Target date is required'); return; }

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        targetDate: new Date(form.targetDate).toISOString(),
        passRateTarget: form.passRateTarget ? parseFloat(form.passRateTarget) : undefined,
        testRunIds: selectedRunIds,
        ...(isEdit ? { status: form.status as any } : {}),
      };

      if (isEdit) {
        await projectApi.updateMilestone(projectId, milestone!.id, payload);
      } else {
        await projectApi.createMilestone(projectId, payload);
      }

      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to save milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? 'Edit Milestone' : 'New Milestone'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Beta Release"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe this milestone..."
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Target Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Pass Rate Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pass Rate Target (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.passRateTarget}
                onChange={(e) => setForm((p) => ({ ...p, passRateTarget: e.target.value }))}
                placeholder="e.g. 95"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status (edit only) */}
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="MISSED">Missed</option>
              </select>
            </div>
          )}

          {/* Link Test Runs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link Test Runs
            </label>
            {testRunOptions.length === 0 ? (
              <p className="text-xs text-gray-400">No test runs found for this project.</p>
            ) : (
              <div className="max-h-36 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {testRunOptions.map((run) => (
                  <label
                    key={run.id}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRunIds.includes(run.id)}
                      onChange={() => toggleRun(run.id)}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700">{run.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">{run.status}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Milestone'}
          </button>
        </div>
      </div>
    </div>
  );
}

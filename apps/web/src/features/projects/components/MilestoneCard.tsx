// File: apps/web/src/features/projects/components/MilestoneCard.tsx

import type { Milestone } from '../types/project.types';
import { projectApi } from '../api/projectApi';

interface Props {
  milestone: Milestone;
  projectId: string;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

const statusConfig = {
  UPCOMING:    { color: 'bg-gray-100 text-gray-600',   icon: '🕐' },
  IN_PROGRESS: { color: 'bg-amber-100 text-amber-700', icon: '🔄' },
  COMPLETED:   { color: 'bg-green-100 text-green-700', icon: '✅' },
  MISSED:      { color: 'bg-red-100 text-red-600',     icon: '❌' },
};

export default function MilestoneCard({ milestone, projectId, onEdit, onDelete, onRefresh }: Props) {
  const cfg = statusConfig[milestone.status];
  const progress = milestone.progress;
  const daysUntil = Math.ceil(
    (new Date(milestone.targetDate).getTime() - Date.now()) / 86_400_000
  );

  const handleUnlinkRun = async (testRunId: string) => {
    await projectApi.unlinkTestRun(projectId, milestone.id, testRunId);
    onRefresh();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
              {cfg.icon} {milestone.status.replace('_', ' ')}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900">{milestone.name}</h3>
          {milestone.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{milestone.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-xs text-indigo-500 hover:underline">Edit</button>
          <button onClick={onDelete} className="text-xs text-red-400 hover:underline">Delete</button>
        </div>
      </div>

      {/* Target date */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Target Date</span>
        <span className={`font-medium ${daysUntil < 0 ? 'text-red-500' : daysUntil <= 7 ? 'text-amber-600' : 'text-gray-700'}`}>
          {new Date(milestone.targetDate).toLocaleDateString()}
          {daysUntil >= 0 ? (
            <span className="text-xs ml-1 text-gray-400">({daysUntil}d left)</span>
          ) : (
            <span className="text-xs ml-1 text-red-400">({Math.abs(daysUntil)}d overdue)</span>
          )}
        </span>
      </div>

      {/* Pass rate target */}
      {milestone.passRateTarget != null && progress && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Pass Rate</span>
            <span>
              {progress.averagePassRate}% / {milestone.passRateTarget}% target
              {progress.targetMet && ' ✅'}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${progress.targetMet ? 'bg-green-500' : 'bg-indigo-500'}`}
              style={{ width: `${Math.min(progress.averagePassRate, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Test Runs */}
      {(milestone.testRuns ?? []).length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Linked Test Runs ({progress?.completedTestRuns}/{progress?.totalTestRuns} completed)
          </p>
          <div className="space-y-1">
            {milestone.testRuns!.map((entry) => (
              <div
                key={entry.testRunId}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 text-xs"
              >
                <span className="text-gray-700">{entry.testRun.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs ${
                      entry.testRun.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {entry.testRun.status}
                  </span>
                  <button
                    onClick={() => handleUnlinkRun(entry.testRunId)}
                    className="text-red-400 hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

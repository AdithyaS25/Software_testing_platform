// File: apps/web/src/features/projects/components/ProjectMilestonesTab.tsx

import { useEffect, useState } from 'react';
import { projectApi } from '../api/projectApi';
import type { Milestone, MilestoneStatus } from '../types/project.types';
import MilestoneFormModal from './MilestoneFormModal';
import MilestoneCard from './MilestoneCard';

interface Props {
  projectId: string;
}

export default function ProjectMilestonesTab({ projectId }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Milestone | null>(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getMilestones(projectId);
      setMilestones(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, [projectId]);

  const handleDelete = async (milestoneId: string) => {
    if (!confirm('Delete this milestone?')) return;
    await projectApi.deleteMilestone(projectId, milestoneId);
    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
  };

  const handleSaved = () => {
    setShowModal(false);
    setEditing(null);
    fetch();
  };

  if (loading) return <div className="text-center py-10 text-gray-400">Loading milestones...</div>;

  const grouped: Record<MilestoneStatus, Milestone[]> = {
    IN_PROGRESS: milestones.filter((m) => m.status === 'IN_PROGRESS'),
    UPCOMING: milestones.filter((m) => m.status === 'UPCOMING'),
    COMPLETED: milestones.filter((m) => m.status === 'COMPLETED'),
    MISSED: milestones.filter((m) => m.status === 'MISSED'),
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Milestones</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-indigo-700"
        >
          + Add Milestone
        </button>
      </div>

      {milestones.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400">No milestones yet. Create one to track your release targets.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(['IN_PROGRESS', 'UPCOMING', 'COMPLETED', 'MISSED'] as MilestoneStatus[]).map(
            (status) =>
              grouped[status].length > 0 && (
                <div key={status}>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    {status.replace('_', ' ')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grouped[status].map((milestone) => (
                      <MilestoneCard
                        key={milestone.id}
                        milestone={milestone}
                        projectId={projectId}
                        onEdit={() => { setEditing(milestone); setShowModal(true); }}
                        onDelete={() => handleDelete(milestone.id)}
                        onRefresh={fetch}
                      />
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}

      {showModal && (
        <MilestoneFormModal
          projectId={projectId}
          milestone={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

// File: apps/web/src/features/projects/components/ProjectMembersTab.tsx

import { useState } from 'react';
import { projectApi } from '../api/projectApi';
import type { Project } from '../types/project.types';
import { useAuth } from '../../../app/providers/AuthProvider';

interface Props {
  project: Project;
  onRefresh: () => void;
}

export default function ProjectMembersTab({ project, onRefresh }: Props) {
  const { user } = useAuth();
  const [newUserId, setNewUserId] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const isOwner = user?.id === project.ownerId;

  const handleAdd = async () => {
    if (!newUserId.trim()) return;
    try {
      setAdding(true);
      setError('');
      await projectApi.addMembers(project.id, { userIds: [newUserId.trim()] });
      setNewUserId('');
      onRefresh();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the project?')) return;
    await projectApi.removeMember(project.id, userId);
    onRefresh();
  };

  const roleColors: Record<string, string> = {
    TESTER: 'bg-purple-100 text-purple-700',
    DEVELOPER: 'bg-blue-100 text-blue-700',
    ADMIN: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Add member (owner only) */}
      {isOwner && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Add Member</h3>
          <p className="text-xs text-gray-400 mb-3">Enter the User ID of the member to add.</p>
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="User ID (cuid)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="bg-indigo-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-60"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Member list */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {(project.members ?? []).map((member) => (
          <div key={member.userId} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{member.user.name}</p>
              <p className="text-xs text-gray-400">{member.user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  roleColors[member.user.role] ?? 'bg-gray-100 text-gray-600'
                }`}
              >
                {member.user.role}
              </span>
              {member.userId === project.ownerId && (
                <span className="text-xs text-amber-600 font-medium">Owner</span>
              )}
              {isOwner && member.userId !== project.ownerId && (
                <button
                  onClick={() => handleRemove(member.userId)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

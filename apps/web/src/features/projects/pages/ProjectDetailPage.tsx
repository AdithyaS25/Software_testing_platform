// File: apps/web/src/features/projects/pages/ProjectDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import type { Project } from '../types/project.types';
import ProjectOverviewTab from '../components/ProjectOverviewTab';
import ProjectMembersTab from '../components/ProjectMembersTab';
import ProjectSettingsTab from '../components/ProjectSettingsTab';
import ProjectMilestonesTab from '../components/ProjectMilestonesTab';

type Tab = 'overview' | 'milestones' | 'members' | 'settings';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'members', label: 'Members' },
  { key: 'settings', label: 'Settings' },
];

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await projectApi.getById(projectId);
      setProject(data);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading project...</div>;
  if (!project) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate('/projects')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Projects
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-2.5 py-1 rounded">
              {project.key}
            </span>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                project.status === 'ACTIVE'
                  ? 'bg-green-100 text-green-700'
                  : project.status === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {project.status}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1">{project.description}</p>
          )}

          {/* Tabs */}
          <div className="flex gap-6 mt-5 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'overview' && (
          <ProjectOverviewTab project={project} />
        )}
        {activeTab === 'milestones' && (
          <ProjectMilestonesTab projectId={project.id} />
        )}
        {activeTab === 'members' && (
          <ProjectMembersTab project={project} onRefresh={fetchProject} />
        )}
        {activeTab === 'settings' && (
          <ProjectSettingsTab project={project} onUpdated={fetchProject} />
        )}
      </div>
    </div>
  );
}

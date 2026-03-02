// File: apps/web/src/features/projects/pages/ProjectsPage.tsx

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import type { Project, ProjectStatus } from '../types/project.types';
import CreateProjectModal from '../components/CreateProjectModal';

const statusColors: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      setProjects(data);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreated = (project: Project) => {
    setShowCreateModal(false);
    navigate(`/projects/${project.id}`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading projects...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          + New Project
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 text-lg mb-4">No projects yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            Create your first project
          </button>
        </div>
      )}

      {/* Project grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <Link
            key={project.id}
            to={`/projects/${project.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">
                  {project.key}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status]}`}
                >
                  {project.status}
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition text-base mb-1">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                {project.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
              <span>🧪 {project._count?.testCases ?? 0} Tests</span>
              <span>🐛 {project._count?.bugs ?? 0} Bugs</span>
              <span>👥 {project._count?.members ?? 0} Members</span>
            </div>
          </Link>
        ))}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

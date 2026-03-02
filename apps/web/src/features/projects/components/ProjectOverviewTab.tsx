// File: apps/web/src/features/projects/components/ProjectOverviewTab.tsx

import type { Project } from '../types/project.types';
import { Link } from 'react-router-dom';

interface Props {
  project: Project;
}

const StatCard = ({
  label,
  value,
  color,
  linkTo,
}: {
  label: string;
  value: number;
  color: string;
  linkTo?: string;
}) => {
  const inner = (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
  return linkTo ? <Link to={linkTo}>{inner}</Link> : inner;
};

export default function ProjectOverviewTab({ project }: Props) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Test Cases"
          value={project._count?.testCases ?? 0}
          color="text-indigo-600"
          linkTo={`/test-cases?projectId=${project.id}`}
        />
        <StatCard
          label="Bugs"
          value={project._count?.bugs ?? 0}
          color="text-red-500"
          linkTo={`/bugs?projectId=${project.id}`}
        />
        <StatCard
          label="Test Runs"
          value={project._count?.testRuns ?? 0}
          color="text-amber-500"
          linkTo={`/test-runs?projectId=${project.id}`}
        />
        <StatCard
          label="Members"
          value={project._count?.members ?? 0}
          color="text-green-600"
        />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Project Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Project Key</span>
              <span className="font-mono font-bold text-indigo-600">{project.key}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
            <div className="flex justify-between">
              <span className="text-gray-500">Owner</span>
              <span className="text-gray-800">{project.owner?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created</span>
              <span className="text-gray-800">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Environments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Environments</h3>
          {(project.environments ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No environments configured. Add them in Settings.</p>
          ) : (
            <div className="space-y-2">
              {(project.environments ?? []).map((env) => (
                <div
                  key={env.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-medium text-gray-700">{env.name}</span>
                  {env.url ? (
                    <a
                      href={env.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-500 hover:underline text-xs truncate max-w-[180px]"
                    >
                      {env.url}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs">No URL</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

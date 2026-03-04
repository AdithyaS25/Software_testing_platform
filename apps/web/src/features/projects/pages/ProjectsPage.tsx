// File: apps/web/src/features/projects/pages/ProjectsPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import type { Project } from '../types/project.types';
import CreateProjectModal from '../components/CreateProjectModal';
import { ConfirmDialog } from '../../../shared/components/ui';

const statusStyle: Record<string, { bg: string; color: string }> = {
  ACTIVE:    { bg: 'var(--success-muted, rgba(34,197,94,0.12))', color: 'var(--success, #16a34a)' },
  ARCHIVED:  { bg: 'var(--bg-elevated)',                         color: 'var(--text-muted)' },
  COMPLETED: { bg: 'var(--accent-muted)',                        color: 'var(--accent)' },
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects]           = useState<Project[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget]   = useState<Project | null>(null);
  const [deleting, setDeleting]           = useState(false);

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

  useEffect(() => { fetchProjects(); }, []);

  const handleCreated = (project: Project) => {
    setShowCreateModal(false);
    navigate(`/projects/${project.id}/dashboard`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectApi.delete(deleteTarget.id);
      setProjects(p => p.filter(proj => proj.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // keep dialog open, show nothing — a toast would need useToast import
      alert('Failed to delete project. You may not have permission.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading projects...</div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 'var(--radius-md)',
            padding: '8px 16px', fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all var(--transition)',
            fontFamily: 'var(--font-sans)',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <span style={{ fontSize: '1rem' }}>+</span> New Project
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 20px',
          background: 'var(--bg-surface)', border: '1px dashed var(--border)',
          borderRadius: 'var(--radius-lg)', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗂</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: 20 }}>No projects yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '9px 20px',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Create your first project
          </button>
        </div>
      )}

      {/* Project grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 16,
      }}>
        {projects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}/dashboard`)}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 20,
              cursor: 'pointer', transition: 'all var(--transition)',
              position: 'relative',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(61,111,255,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            {/* Top row: key + status + delete */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{
                background: 'var(--accent-muted)', color: 'var(--accent)',
                fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px',
                borderRadius: 'var(--radius-sm)', letterSpacing: '0.06em',
                fontFamily: 'var(--font-mono)',
              }}>
                {project.key}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.7rem', fontWeight: 600, padding: '3px 8px',
                  borderRadius: 10,
                  background: statusStyle[project.status]?.bg ?? 'var(--bg-elevated)',
                  color: statusStyle[project.status]?.color ?? 'var(--text-muted)',
                }}>
                  {project.status}
                </span>

                {/* ── Delete button ── */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // prevent navigating into project
                    setDeleteTarget(project);
                  }}
                  title="Delete project"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: 'var(--radius-sm)',
                    border: '1px solid transparent',
                    background: 'transparent', color: 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.8rem',
                    transition: 'all var(--transition)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'var(--danger-muted)';
                    e.currentTarget.style.borderColor = 'rgba(255,77,106,0.3)';
                    e.currentTarget.style.color = 'var(--danger)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  🗑
                </button>
              </div>
            </div>

            {/* Name */}
            <h3 style={{
              fontSize: '0.975rem', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 4,
              letterSpacing: '-0.01em',
            }}>
              {project.name}
            </h3>

            {/* Description */}
            {project.description && (
              <p style={{
                fontSize: '0.8rem', color: 'var(--text-muted)',
                marginBottom: 14, lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {project.description}
              </p>
            )}

            {/* Stats row */}
            <div style={{
              display: 'flex', gap: 16,
              paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
              marginTop: project.description ? 0 : 12,
            }}>
              {[
                { icon: '🧪', label: 'Tests',   count: project._count?.testCases ?? 0 },
                { icon: '🐛', label: 'Bugs',    count: project._count?.bugs ?? 0 },
                { icon: '▷',  label: 'Runs',    count: project._count?.testRuns ?? 0 },
                { icon: '👥', label: 'Members', count: project._count?.members ?? 0 },
              ].map(({ icon, label, count }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.75rem' }}>{icon}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{count}</span> {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This will permanently remove all test cases, bugs, runs, and data associated with this project. This action cannot be undone.`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Project'}
        variant="danger"
      />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import type { Project } from '../types/project.types';
import CreateProjectModal from '../components/CreateProjectModal';
import { ConfirmDialog } from '../../../shared/components/ui';

const statusConfig: Record<string, { color: string; bg: string; glow: string }> = {
  ACTIVE:    { color: "var(--success)", bg: "rgba(34,217,160,0.1)", glow: "rgba(34,217,160,0.2)" },
  ARCHIVED:  { color: "var(--text-muted)", bg: "rgba(255,255,255,0.05)", glow: "transparent" },
  COMPLETED: { color: "var(--accent-2)", bg: "rgba(61,217,255,0.1)", glow: "rgba(61,217,255,0.15)" },
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [projects,        setProjects]        = useState<Project[]>([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget,    setDeleteTarget]    = useState<Project | null>(null);
  const [deleting,        setDeleting]        = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectApi.getAll();
      // ✅ Bug 3 fixed: client-side safety filter — never show ARCHIVED or DELETED
      setProjects(
  (data || []).filter((p: Project) => p.status !== 'ARCHIVED')
);
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
      // ✅ Bug 3 fixed: remove from list immediately after delete succeeds
      setProjects(p => p.filter(proj => proj.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('permission') || msg.toLowerCase().includes('forbidden')) {
        alert('You do not have permission to delete this project. Only the project owner can delete it.');
      } else {
        alert('Failed to delete project. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
      <div style={{ textAlign: 'center' }}>
        <div className="tt-spinner" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading projects...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{
        color: 'var(--danger)', fontSize: '0.9rem',
        background: 'rgba(255,79,109,0.08)',
        border: '1px solid rgba(255,79,109,0.2)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>⚠ {error}</div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="shine"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, var(--accent) 0%, #5a35d9 100%)',
            color: '#fff', border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
            fontSize: '0.875rem', fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(120,87,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.01em',
            transition: 'all var(--transition)',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(120,87,255,0.5), inset 0 1px 0 rgba(255,255,255,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(120,87,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
          }}
        >
          <span style={{ fontSize: '1.1rem', fontWeight: 400 }}>+</span> New Project
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 20px',
          background: 'rgba(255,255,255,0.015)',
          border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 16, filter: 'drop-shadow(0 0 20px rgba(120,87,255,0.4))' }}>🗂</div>
          <p style={{
            color: 'var(--text-secondary)', fontSize: '1.05rem',
            fontWeight: 600, marginBottom: 8, fontFamily: 'var(--font-display)',
          }}>No projects yet</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Create your first project to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #5a35d9 100%)',
              color: '#fff', border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '10px 22px',
              fontSize: '0.875rem', fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(120,87,255,0.35)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Create your first project
          </button>
        </div>
      )}

      {/* Project grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 18,
      }}>
        {projects.map((project) => {
          const sc = statusConfig[project.status] || statusConfig.ARCHIVED;
          return (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}/dashboard`)}
              className="card-3d"
              style={{
                background: 'rgba(14, 17, 35, 0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-lg)',
                padding: 22,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: 'var(--shadow-card)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(120,87,255,0.35)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(120,87,255,0.08), inset 0 1px 0 rgba(255,255,255,0.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: `linear-gradient(90deg, transparent, ${sc.color}, transparent)`,
                opacity: 0.6,
              }} />

              {/* Background glow */}
              <div style={{
                position: 'absolute', top: -30, right: -30,
                width: 120, height: 120,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${sc.glow} 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />

              {/* Top row: key + status + delete */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{
                  background: 'rgba(120,87,255,0.12)',
                  color: 'var(--accent)',
                  fontSize: '0.7rem', fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  letterSpacing: '0.1em',
                  fontFamily: 'var(--font-mono)',
                  border: '1px solid rgba(120,87,255,0.2)',
                }}>
                  {project.key}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '3px 9px',
                    borderRadius: '100px',
                    background: sc.bg,
                    color: sc.color,
                    border: `1px solid ${sc.color}30`,
                    fontFamily: 'var(--font-display)',
                  }}>
                    {project.status}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(project); }}
                    title="Delete project"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                      border: '1px solid transparent',
                      background: 'transparent', color: 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '0.85rem',
                      transition: 'all var(--transition)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,79,109,0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255,79,109,0.3)';
                      e.currentTarget.style.color = 'var(--danger)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                  >🗑</button>
                </div>
              </div>

              {/* Name */}
              <h3 style={{
                fontSize: '1rem', fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 5,
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-display)',
              }}>
                {project.name}
              </h3>

              {/* Description */}
              {project.description && (
                <p style={{
                  fontSize: '0.8rem', color: 'var(--text-muted)',
                  marginBottom: 16, lineHeight: 1.6,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {project.description}
                </p>
              )}

              {/* Stats row */}
              <div style={{
                display: 'flex', gap: 0,
                paddingTop: 14,
                borderTop: '1px solid rgba(255,255,255,0.05)',
                marginTop: project.description ? 0 : 14,
              }}>
                {[
                  { icon: '🧪', label: 'Tests',   count: project._count?.testCases ?? 0 },
                  { icon: '🐛', label: 'Bugs',    count: project._count?.bugs ?? 0 },
                  { icon: '▷',  label: 'Runs',    count: project._count?.testRuns ?? 0 },
                  { icon: '👥', label: 'Members', count: project._count?.members ?? 0 },
                ].map(({ icon, label, count }, i, arr) => (
                  <div key={label} style={{
                    flex: 1,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    padding: '0 4px',
                  }}>
                    <span style={{ fontSize: '1rem', marginBottom: 2 }}>{icon}</span>
                    <span style={{
                      fontSize: '0.95rem', fontWeight: 800,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '-0.02em',
                    }}>{count}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}

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

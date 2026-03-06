// File: apps/web/src/features/projects/pages/ProjectDetailPage.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectApi } from '../api/projectApi';
import { useAuth } from '../../../app/providers/AuthProvider';
import type { Project } from '../types/project.types';
import ProjectOverviewTab   from '../components/ProjectOverviewTab';
import ProjectMembersTab    from '../components/ProjectMembersTab';
import ProjectSettingsTab   from '../components/ProjectSettingsTab';
import ProjectMilestonesTab from '../components/ProjectMilestonesTab';

type Tab = 'overview' | 'milestones' | 'members' | 'settings';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate      = useNavigate();
  const { user }      = useAuth();

  const [project,   setProject]   = useState<Project | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('members');

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError('');
      const data = await projectApi.getById(projectId);
      setProject(data);
    } catch (err: any) {
      // ✅ Show actual error instead of silently redirecting
      const status  = err?.response?.status;
      const message = err?.response?.data?.message || 'Failed to load project';
      if (status === 403) {
        setError('You do not have access to this project.');
      } else if (status === 404) {
        setError('Project not found.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [projectId]);

  // ✅ Only show Settings tab to the project owner
  const isOwner = project?.owner?.id === user?.id || (project as any)?.ownerId === user?.id;

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview',   label: 'Overview',   icon: '▦'  },
    { key: 'milestones', label: 'Milestones', icon: '🎯' },
    { key: 'members',    label: 'Members',    icon: '👥' },
    // ✅ Settings only visible to owner — developers can't change project config
    ...(isOwner ? [{ key: 'settings' as Tab, label: 'Settings', icon: '⚙' }] : []),
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 80 }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading project...</div>
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 16 }}>
      <div style={{
        color: 'var(--danger)', fontSize: '0.9rem',
        background: 'rgba(255,79,109,0.08)', border: '1px solid rgba(255,79,109,0.2)',
        borderRadius: 'var(--radius-md)', padding: '14px 22px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        ⚠ {error}
      </div>
      <button
        onClick={() => navigate('/projects')}
        style={{
          background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem',
        }}
      >
        ← Back to Projects
      </button>
    </div>
  );

  if (!project) return null;

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <button
              onClick={() => navigate('/projects')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', padding: 0 }}
            >
              ← Projects
            </button>
            <span style={{ color: 'var(--border)', fontSize: '0.85rem' }}>/</span>
            <span style={{
              background: 'var(--accent-muted)', color: 'var(--accent)',
              fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)',
            }}>
              {project.key}
            </span>
          </div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 16px', fontSize: '0.875rem', fontWeight: active ? 600 : 400,
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                marginBottom: -1, transition: 'all var(--transition)',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === 'overview'   && <ProjectOverviewTab   project={project} />}
        {activeTab === 'milestones' && <ProjectMilestonesTab projectId={project.id} />}
        {activeTab === 'members'    && <ProjectMembersTab    project={project} onRefresh={fetchProject} />}
        {activeTab === 'settings'   && isOwner && <ProjectSettingsTab project={project} onUpdated={fetchProject} />}
      </div>
    </div>
  );
}

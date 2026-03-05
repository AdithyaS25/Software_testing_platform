// File: apps/web/src/features/projects/components/ProjectOverviewTab.tsx

import { useNavigate, useParams } from 'react-router-dom';
import type { Project } from '../types/project.types';

interface Props { project: Project; }

export default function ProjectOverviewTab({ project }: Props) {
  const { projectId } = useParams<{ projectId: string }>();
  const nav = useNavigate();

  const stats = [
    { label: 'Test Cases', value: project._count?.testCases ?? 0, icon: '✎', color: 'var(--accent)',   path: `/projects/${projectId}/test-cases` },
    { label: 'Bugs',       value: project._count?.bugs      ?? 0, icon: '🐛', color: 'var(--danger)',  path: `/projects/${projectId}/bugs` },
    { label: 'Test Runs',  value: project._count?.testRuns  ?? 0, icon: '▷',  color: 'var(--warning)', path: `/projects/${projectId}/test-runs` },
    { label: 'Members',    value: project._count?.members   ?? 0, icon: '👥', color: 'var(--info)',    path: null },
  ];

  const statusColor: Record<string, { color: string; bg: string }> = {
    ACTIVE:    { color: 'var(--success)', bg: 'rgba(34,197,94,0.1)' },
    COMPLETED: { color: 'var(--accent-2)', bg: 'rgba(20,184,166,0.1)' },
    ARCHIVED:  { color: 'var(--text-muted)', bg: 'rgba(255,255,255,0.05)' },
  };
  const sc = statusColor[project.status] ?? statusColor.ARCHIVED;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease' }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {stats.map(({ label, value, icon, color, path }) => (
          <div
            key={label}
            onClick={() => path && nav(path)}
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)',
              padding: '18px 20px',
              cursor: path ? 'pointer' : 'default',
              transition: 'all var(--transition)',
              backdropFilter: 'blur(12px)',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (!path) return;
              (e.currentTarget as HTMLDivElement).style.borderColor = color;
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${color}30`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-glass)';
              (e.currentTarget as HTMLDivElement).style.transform = '';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '';
            }}
          >
            {/* Background glow */}
            <div style={{
              position: 'absolute', top: -10, right: -10,
              width: 70, height: 70, borderRadius: '50%',
              background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-sm)',
              background: `${color}18`, border: `1px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', marginBottom: 12,
            }}>{icon}</div>
            <div style={{
              fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', letterSpacing: '-0.04em', lineHeight: 1,
              marginBottom: 4,
            }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
            {path && (
              <div style={{
                position: 'absolute', bottom: 14, right: 16,
                fontSize: '0.7rem', color: color, opacity: 0.6,
              }}>→</div>
            )}
          </div>
        ))}
      </div>

      {/* Details + Environments row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Project Details */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 22px',
          backdropFilter: 'blur(12px)',
        }}>
          <h3 style={{
            fontSize: '0.72rem', fontWeight: 700,
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 18,
            fontFamily: 'var(--font-display)',
          }}>Project Details</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              {
                label: 'Project Key',
                value: (
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                    color: 'var(--accent)', background: 'var(--accent-muted)',
                    padding: '2px 10px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-em)',
                  }}>{project.key}</span>
                ),
              },
              {
                label: 'Status',
                value: (
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '100px',
                    background: sc.bg, color: sc.color,
                    border: `1px solid ${sc.color}30`,
                  }}>{project.status}</span>
                ),
              },
              {
                label: 'Owner',
                value: (
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 500 }}>
                    {project.owner?.email?.split('@')[0] ?? '—'}
                  </span>
                ),
              },
              {
                label: 'Created',
                value: (
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                ),
              },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 14,
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                {value}
              </div>
            ))}
          </div>
        </div>

        {/* Environments */}
        <div style={{
          background: 'rgba(255,255,255,0.025)',
          border: '1px solid var(--border-glass)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 22px',
          backdropFilter: 'blur(12px)',
        }}>
          <h3 style={{
            fontSize: '0.72rem', fontWeight: 700,
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            textTransform: 'uppercase', marginBottom: 18,
            fontFamily: 'var(--font-display)',
          }}>Environments</h3>

          {(project.environments ?? []).length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '28px 16px',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-md)', textAlign: 'center',
            }}>
              <span style={{ fontSize: '1.5rem', marginBottom: 8, opacity: 0.4 }}>🌐</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                No environments configured.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                Add them in Settings.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(project.environments ?? []).map((env: any) => (
                <div key={env.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--success)',
                      boxShadow: '0 0 6px var(--success)',
                    }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {env.name}
                    </span>
                  </div>
                  {env.url ? (
                    <a
                      href={env.url} target="_blank" rel="noreferrer"
                      style={{
                        fontSize: '0.75rem', color: 'var(--accent-2)',
                        textDecoration: 'none', maxWidth: 160,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {env.url}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No URL</span>
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

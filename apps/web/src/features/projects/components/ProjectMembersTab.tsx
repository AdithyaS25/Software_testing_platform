// File: apps/web/src/features/projects/components/ProjectMembersTab.tsx

import { useState } from 'react';
import { projectApi } from '../api/projectApi';
import type { Project } from '../types/project.types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Button, FormField, useToast } from '../../../shared/components/ui';

interface Props {
  project: Project;
  onRefresh: () => void;
}

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  TESTER: { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
  DEVELOPER: { bg: 'var(--accent-muted)', color: 'var(--accent)' },
  ADMIN: { bg: 'var(--danger-muted)', color: 'var(--danger)' },
};

export default function ProjectMembersTab({ project, onRefresh }: Props) {
  const { user } = useAuth();
  const toast = useToast();
  const isOwner = user?.id === project.ownerId;

  const [newUserId, setNewUserId] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newUserId.trim()) return;
    setAdding(true);
    try {
      await projectApi.addMembers(project.id, { userIds: [newUserId.trim()] });
      setNewUserId('');
      onRefresh();
      toast.success('Member added successfully');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          'Failed to add member — check the User ID'
      );
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (userId: string, email: string) => {
    if (!confirm(`Remove ${email} from this project?`)) return;
    setRemoving(userId);
    try {
      await projectApi.removeMember(project.id, userId);
      onRefresh();
      toast.success('Member removed');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  const members = project.members ?? [];

  return (
    <div style={{ maxWidth: 680 }}>
      {/* ── Add member (owner only) ── */}
      {isOwner && (
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: 20,
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 4,
            }}
          >
            Add Member
          </h3>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: 14,
            }}
          >
            Enter the User ID of the person to add. You can find User IDs in
            your database or admin panel.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <FormField label="User ID">
                <input
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  placeholder="e.g. clxxxxxxxxxxxxx"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
              </FormField>
            </div>
            <Button
              onClick={handleAdd}
              loading={adding}
              disabled={!newUserId.trim()}
              style={{ marginBottom: 14 }}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* ── Member list ── */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Members ({members.length})
          </span>
        </div>

        {members.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.875rem',
            }}
          >
            No members yet
          </div>
        ) : (
          members.map((member, i) => {
            const roleStyle = ROLE_COLORS[member.user?.role] ?? {
              bg: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
            };
            const isProjectOwner = member.userId === project.ownerId;
            const isCurrentUser = member.userId === user?.id;

            return (
              <div
                key={member.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom:
                    i < members.length - 1
                      ? '1px solid var(--border-subtle)'
                      : 'none',
                }}
              >
                {/* Avatar + info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: 'var(--accent-muted)',
                      border: '1px solid var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      flexShrink: 0,
                    }}
                  >
                    {member.user?.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {member.user?.email?.split('@')[0]}
                      {isCurrentUser && (
                        <span
                          style={{
                            marginLeft: 6,
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            fontWeight: 400,
                          }}
                        >
                          (you)
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {member.user?.email}
                    </div>
                  </div>
                </div>

                {/* Role + owner badge + remove */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: 100,
                      background: roleStyle.bg,
                      color: roleStyle.color,
                    }}
                  >
                    {member.user?.role}
                  </span>

                  {isProjectOwner && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 100,
                        background: 'var(--warning-muted)',
                        color: 'var(--warning)',
                      }}
                    >
                      Owner
                    </span>
                  )}

                  {isOwner && !isProjectOwner && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={removing === member.userId}
                      onClick={() =>
                        handleRemove(member.userId, member.user?.email ?? '')
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

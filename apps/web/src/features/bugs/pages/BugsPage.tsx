import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';
import { useAuth } from '../../../app/providers/AuthProvider';
import {
  Button,
  PriorityBadge,
  SeverityBadge,
  StatusBadge,
  SearchInput,
  Select,
  EmptyState,
  Spinner,
} from '../../../shared/components/ui';

export const BugsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const [bugs, setBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [view, setView] = useState<'all' | 'mine'>(
    user?.role === 'DEVELOPER' ? 'mine' : 'all'
  );

  const load = () => {
    if (!projectId) return;
    setLoading(true);
    const endpoint =
      view === 'mine' && user?.role === 'DEVELOPER'
        ? `/api/projects/${projectId}/bugs/my`
        : `/api/projects/${projectId}/bugs`;
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (priorityFilter) params.set('priority', priorityFilter);
    if (severityFilter) params.set('severity', severityFilter);
    apiClient
      .get(`${endpoint}?${params}`)
      .then((r) => {
        setBugs(r.data.data || r.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [projectId, view, statusFilter, priorityFilter, severityFilter]);

  const filtered = bugs.filter(
    (b) =>
      !search ||
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.bugId?.toLowerCase().includes(search.toLowerCase())
  );

  const ageLabel = (date: string) => {
    if (!date) return '—';
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days}d ago`;
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bug Reports</h1>
          <p className="page-subtitle">{bugs.length} bugs tracked</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {user?.role === 'DEVELOPER' && (
            <div
              style={{
                display: 'flex',
                background: 'rgba(14,17,35,0.8)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 'var(--radius-md)',
                padding: 3,
                backdropFilter: 'blur(8px)',
              }}
            >
              {['all', 'mine'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as 'all' | 'mine')}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    cursor: 'pointer',
                    background:
                      view === v
                        ? 'linear-gradient(135deg, var(--accent) 0%, #5a35d9 100%)'
                        : 'transparent',
                    color: view === v ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-display)',
                    transition: 'all var(--transition)',
                    boxShadow:
                      view === v ? '0 2px 10px rgba(120,87,255,0.3)' : 'none',
                  }}
                >
                  {v === 'all' ? 'All Bugs' : 'My Bugs'}
                </button>
              ))}
            </div>
          )}
          {(user?.role === 'TESTER' || user?.role === 'ADMIN') && (
            <Button onClick={() => nav(`/projects/${projectId}/bugs/new`)}>
              + Create Bug
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search bugs..."
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Statuses"
          options={[
            { value: 'NEW', label: 'New' },
            { value: 'OPEN', label: 'Open' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'FIXED', label: 'Fixed' },
            { value: 'VERIFIED', label: 'Verified' },
            { value: 'CLOSED', label: 'Closed' },
            { value: 'REOPENED', label: 'Reopened' },
          ]}
        />
        <Select
          value={priorityFilter}
          onChange={setPriorityFilter}
          placeholder="All Priorities"
          options={[
            { value: 'P1_URGENT', label: 'P1 Urgent' },
            { value: 'P2_HIGH', label: 'P2 High' },
            { value: 'P3_MEDIUM', label: 'P3 Medium' },
            { value: 'P4_LOW', label: 'P4 Low' },
          ]}
        />
        <Select
          value={severityFilter}
          onChange={setSeverityFilter}
          placeholder="All Severities"
          options={[
            { value: 'BLOCKER', label: 'Blocker' },
            { value: 'CRITICAL', label: 'Critical' },
            { value: 'MAJOR', label: 'Major' },
            { value: 'MINOR', label: 'Minor' },
            { value: 'TRIVIAL', label: 'Trivial' },
          ]}
        />
        {(statusFilter || priorityFilter || severityFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('');
              setPriorityFilter('');
              setSeverityFilter('');
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Spinner size={28} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⚠"
          title="No bugs found"
          desc="No bug reports match your current filters"
          action={
            user?.role === 'TESTER' || user?.role === 'ADMIN' ? (
              <Button onClick={() => nav(`/projects/${projectId}/bugs/new`)}>
                Create Bug Report
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          style={{
            background: 'rgba(14, 17, 35, 0.7)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <table className="tt-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Age</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bug) => (
                <tr key={bug.id}>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(255,255,255,0.04)',
                        padding: '2px 7px',
                        borderRadius: 4,
                      }}
                    >
                      {bug.bugId || bug.id?.slice(0, 8)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        nav(`/projects/${projectId}/bugs/${bug.id}`)
                      }
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        textAlign: 'left',
                        fontFamily: 'var(--font-sans)',
                        padding: 0,
                        transition: 'color var(--transition)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      {bug.title}
                    </button>
                  </td>
                  <td>
                    <PriorityBadge
                      value={bug.priority
                        ?.replace('P1_URGENT', 'CRITICAL')
                        ?.replace('P2_HIGH', 'HIGH')
                        ?.replace('P3_MEDIUM', 'MEDIUM')
                        ?.replace('P4_LOW', 'LOW')}
                    />
                  </td>
                  <td>
                    <SeverityBadge value={bug.severity} />
                  </td>
                  <td>
                    <StatusBadge value={bug.status} />
                  </td>
                  <td>
                    <span
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem',
                      }}
                    >
                      {bug.assignedTo?.email?.split('@')[0] || (
                        <span
                          style={{
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                          }}
                        >
                          Unassigned
                        </span>
                      )}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {ageLabel(bug.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                        justifyContent: 'flex-end',
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          nav(`/projects/${projectId}/bugs/${bug.id}`)
                        }
                      >
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// File: apps/web/src/features/dashboard/pages/DashboardPage.tsx

import { useEffect, useState } from 'react';
import { useAuth } from '../../../app/providers/AuthProvider';
import { getDashboardData } from '../api/dashboard.api';
import { StatCard, Spinner } from '../../../shared/components/ui';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export const DashboardPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData(projectId!)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}
      >
        <Spinner size={36} />
      </div>
    );

  const isTester = user?.role === 'TESTER' || user?.role === 'ADMIN';
  const isDev = user?.role === 'DEVELOPER' || user?.role === 'ADMIN';

  const summary = data?.summary ?? {};

  const totalRuns = summary.totalTestRuns ?? '—';
  const totalExec = summary.totalExecutions ?? '—';
  const passRate = summary.overallPassRate ?? null;
  const totalBugs = summary.totalBugs ?? '—';
  const openBugs = summary.openBugs ?? '—';
  const criticalBugs = summary.criticalBugs ?? '—';

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Hero greeting */}
      <div style={{ marginBottom: 32, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: -20,
            width: 200,
            height: 200,
            background:
              'radial-gradient(circle, rgba(120,87,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <p
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--accent-2)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 6,
            fontFamily: 'var(--font-display)',
          }}
        >
          {greeting} {greetingEmoji}
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            background:
              'linear-gradient(135deg, #eef0ff 0%, var(--accent-2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          {user?.email?.split('@')[0]}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Here's what's happening in your workspace today
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {isTester && (
          <>
            <StatCard
              label="Test Runs"
              value={totalRuns}
              icon="▷"
              color="blue"
              sub="Total cycles"
            />
            <StatCard
              label="Executions"
              value={totalExec}
              icon="✎"
              color="purple"
              sub="All time"
            />
            <StatCard
              label="Pass Rate"
              value={passRate != null ? `${Math.round(passRate)}%` : '—'}
              icon="✓"
              color="green"
              sub="Overall"
            />
          </>
        )}
        {isDev && (
          <>
            <StatCard
              label="Open Bugs"
              value={openBugs}
              icon="⚠"
              color="yellow"
              sub="Needs attention"
            />
            <StatCard
              label="Critical Bugs"
              value={criticalBugs}
              icon="🔴"
              color="red"
              sub="Blocker / Critical"
            />
          </>
        )}
        <StatCard
          label="Total Bugs"
          value={totalBugs}
          icon="⊡"
          color="orange"
          sub="All statuses"
        />
      </div>

      {/* Charts row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <BugStatusBreakdown summary={summary} />
        {isTester && passRate != null && (
          <PassRateBar
            passRate={passRate}
            totalExec={typeof totalExec === 'number' ? totalExec : 0}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ padding: 24 }}>
        <h3
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
            marginBottom: 18,
          }}
        >
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {isTester && (
            <QuickAction
              to={`/projects/${projectId}/test-cases/new`}
              icon="✎"
              label="New Test Case"
              color="var(--accent)"
            />
          )}
          {isTester && (
            <QuickAction
              to={`/projects/${projectId}/test-suites`}
              icon="⊞"
              label="View Suites"
              color="var(--purple)"
            />
          )}
          {isTester && (
            <QuickAction
              to={`/projects/${projectId}/test-runs`}
              icon="▷"
              label="Test Runs"
              color="var(--success)"
            />
          )}
          <QuickAction
            to={`/projects/${projectId}/bugs`}
            icon="⚠"
            label="View Bugs"
            color="var(--danger)"
          />
          <QuickAction
            to={`/projects/${projectId}/reports`}
            icon="⊡"
            label="Reports"
            color="var(--warning)"
          />
        </div>
      </div>
    </div>
  );
};

// ── Bug Status Breakdown ─────────────────────────────────────────────────────
const BugStatusBreakdown = ({ summary }: { summary: any }) => {
  const statuses = [
    { label: 'Open', value: summary.openBugs ?? 0, color: 'var(--warning)' },
    {
      label: 'In Progress',
      value: summary.inProgressBugs ?? summary.openBugs ?? 0,
      color: 'var(--info)',
    },
    {
      label: 'Critical',
      value: summary.criticalBugs ?? 0,
      color: 'var(--danger)',
    },
    { label: 'Fixed', value: summary.fixedBugs ?? 0, color: 'var(--success)' },
  ];
  const max = Math.max(...statuses.map((s) => s.value), 1);
  const total = summary.totalBugs ?? 0;

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
          }}
        >
          Bug Breakdown
        </h3>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            background: 'rgba(255,255,255,0.05)',
            padding: '2px 8px',
            borderRadius: '100px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {total} total
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {statuses.map(({ label, value, color }) => (
          <div key={label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 5,
                fontSize: '0.75rem',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {label}
              </span>
              <span
                style={{
                  color,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {value}
              </span>
            </div>
            <div
              style={{
                height: 5,
                borderRadius: 100,
                background: 'rgba(255,255,255,0.05)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: max > 0 ? `${(value / max) * 100}%` : '0%',
                  borderRadius: 100,
                  background: color,
                  boxShadow: `0 0 6px ${color}60`,
                  transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Pass Rate Bar ─────────────────────────────────────────────────────────────
const PassRateBar = ({
  passRate,
  totalExec,
}: {
  passRate: number;
  totalExec: number;
}) => {
  const pct = Math.round(passRate);

  // Use real hex values — CSS var() strings can't be used with opacity suffixes in gradients
  const hex = pct >= 90 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#f43f5e';
  const label = pct >= 90 ? 'Excellent' : pct >= 70 ? 'Needs work' : 'Critical';

  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="glass-card" style={{ padding: 20 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
          }}
        >
          Pass Rate
        </h3>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            color: hex,
            background: `${hex}18`,
            padding: '2px 8px',
            borderRadius: '100px',
            border: `1px solid ${hex}40`,
          }}
        >
          {label}
        </span>
      </div>

      {/* Big number */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 6,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            lineHeight: 1,
            color: hex,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.04em',
            textShadow: `0 0 20px ${hex}70`,
          }}
        >
          {pct}%
        </span>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: 6,
          }}
        >
          of {totalExec} execution{totalExec !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Progress track — animates from 0 to pct on mount */}
      <div
        style={{
          height: 8,
          borderRadius: 100,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${width}%`,
            borderRadius: 100,
            background: `linear-gradient(90deg, ${hex}99, ${hex})`,
            boxShadow: `0 0 12px ${hex}70`,
            transition: 'width 1s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        />
      </div>

      {/* Tick marks */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {['0', '25%', '50%', '75%', '100%'].map((t) => (
          <span
            key={t}
            style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Quick Action card ─────────────────────────────────────────────────────────
// ── Quick Action card ─────────────────────────────────────────────────────────
const QuickAction = ({
  to,
  icon,
  label,
  color,
}: {
  to: string;
  icon: string;
  label: string;
  color: string;
}) => (
  <Link to={to} style={{ textDecoration: 'none' }}>
    <div
      className="shine"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '10px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all var(--transition)',
        fontFamily: 'var(--font-sans)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = color;
        (e.currentTarget as HTMLDivElement).style.color = color;
        (e.currentTarget as HTMLDivElement).style.background = color + '12';
        (e.currentTarget as HTMLDivElement).style.transform =
          'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 8px 20px rgba(0,0,0,0.2)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLDivElement).style.color =
          'var(--text-secondary)';
        (e.currentTarget as HTMLDivElement).style.background =
          'rgba(255,255,255,0.03)';
        (e.currentTarget as HTMLDivElement).style.transform = '';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '';
      }}
    >
      <span style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}>
        {icon}
      </span>
      {label}
    </div>
  </Link>
);

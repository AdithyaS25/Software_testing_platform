import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, PriorityBadge, SeverityBadge, StatusBadge, SearchInput, Select, EmptyState, Spinner } from "../../../shared/components/ui";

export const BugsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const [bugs, setBugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");
  const [view, setView] = useState<"all" | "mine">(user?.role === "DEVELOPER" ? "mine" : "all");

  const load = () => {
    if (!projectId) return;
    setLoading(true);

    const endpoint =
      view === "mine" && user?.role === "DEVELOPER"
        ? `/api/projects/${projectId}/bugs/my`
        : `/api/projects/${projectId}/bugs`;

    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (priorityFilter) params.set("priority", priorityFilter);
    if (severityFilter) params.set("severity", severityFilter);

    apiClient
      .get(`${endpoint}?${params}`)
      .then((r) => { setBugs(r.data.data || r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId, view, statusFilter, priorityFilter, severityFilter]);

  const filtered = bugs.filter(b =>
    !search ||
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.bugId?.toLowerCase().includes(search.toLowerCase())
  );

  const ageLabel = (date: string) => {
    if (!date) return "—";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    return days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bug Reports</h1>
          <p className="page-subtitle">{bugs.length} bugs</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Developer toggle */}
          {user?.role === "DEVELOPER" && (
            <div style={{
              display: "flex", background: "var(--bg-elevated)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 2,
            }}>
              {["all", "mine"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v as "all" | "mine")}
                  style={{
                    padding: "5px 14px", borderRadius: "var(--radius-sm)",
                    border: "none", cursor: "pointer",
                    background: view === v ? "var(--accent)" : "transparent",
                    color: view === v ? "#fff" : "var(--text-muted)",
                    fontSize: "0.8rem", fontWeight: 500,
                    fontFamily: "var(--font-sans)", transition: "all var(--transition)",
                  }}
                >
                  {v === "all" ? "All Bugs" : "My Bugs"}
                </button>
              ))}
            </div>
          )}

          {/* Create bug — Tester / Admin only */}
          {(user?.role === "TESTER" || user?.role === "ADMIN") && (
            <Button onClick={() => nav(`/projects/${projectId}/bugs/new`)}>+ Create Bug</Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search bugs..." />
        <Select value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses" options={[
          { value: "NEW", label: "New" }, { value: "OPEN", label: "Open" },
          { value: "IN_PROGRESS", label: "In Progress" }, { value: "FIXED", label: "Fixed" },
          { value: "VERIFIED", label: "Verified" }, { value: "CLOSED", label: "Closed" },
          { value: "REOPENED", label: "Reopened" },
        ]} />
        <Select value={priorityFilter} onChange={setPriorityFilter} placeholder="All Priorities" options={[
          { value: "P1_URGENT", label: "P1 Urgent" }, { value: "P2_HIGH", label: "P2 High" },
          { value: "P3_MEDIUM", label: "P3 Medium" }, { value: "P4_LOW", label: "P4 Low" },
        ]} />
        <Select value={severityFilter} onChange={setSeverityFilter} placeholder="All Severities" options={[
          { value: "BLOCKER", label: "Blocker" }, { value: "CRITICAL", label: "Critical" },
          { value: "MAJOR", label: "Major" }, { value: "MINOR", label: "Minor" }, { value: "TRIVIAL", label: "Trivial" },
        ]} />
        {(statusFilter || priorityFilter || severityFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter(""); setPriorityFilter(""); setSeverityFilter(""); }}>Clear</Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="⚠" title="No bugs found"
          desc="No bug reports match your current filters"
          action={
            (user?.role === "TESTER" || user?.role === "ADMIN")
              ? <Button onClick={() => nav(`/projects/${projectId}/bugs/new`)}>Create Bug Report</Button>
              : undefined
          }
        />
      ) : (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table className="tt-table">
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Priority</th><th>Severity</th>
                <th>Status</th><th>Assigned To</th><th>Age</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(bug => (
                <tr key={bug.id}>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {bug.bugId || bug.id?.slice(0, 8)}
                    </span>
                  </td>
                  <td>
                    <button
                      // ← was nav(`/bugs/${bug.id}`) — missing projectId
                      onClick={() => nav(`/projects/${projectId}/bugs/${bug.id}`)}
                      style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer", fontWeight: 500, fontSize: "0.875rem", textAlign: "left", fontFamily: "var(--font-sans)", padding: 0 }}
                      onMouseEnter={e => (e.currentTarget).style.color = "var(--accent)"}
                      onMouseLeave={e => (e.currentTarget).style.color = "var(--text-primary)"}
                    >
                      {bug.title}
                    </button>
                  </td>
                  <td>
                    <PriorityBadge value={
                      bug.priority
                        ?.replace("P1_URGENT", "CRITICAL")
                        ?.replace("P2_HIGH", "HIGH")
                        ?.replace("P3_MEDIUM", "MEDIUM")
                        ?.replace("P4_LOW", "LOW")
                    } />
                  </td>
                  <td><SeverityBadge value={bug.severity} /></td>
                  <td><StatusBadge value={bug.status} /></td>
                  <td>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                      {bug.assignedTo?.email?.split("@")[0] || <span style={{ color: "var(--text-muted)" }}>Unassigned</span>}
                    </span>
                  </td>
                  <td><span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{ageLabel(bug.createdAt)}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {/* ← was nav(`/bugs/${bug.id}`) — missing projectId */}
                      <Button variant="ghost" size="sm" onClick={() => nav(`/projects/${projectId}/bugs/${bug.id}`)}>View</Button>
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
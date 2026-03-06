// File: apps/web/src/features/test-cases/pages/TestCasesPage.tsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import {
  Button, Badge, PriorityBadge, StatusBadge,
  SearchInput, Select, EmptyState, ConfirmDialog, useToast, Spinner,
} from "../../../shared/components/ui";

export const TestCasesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const nav   = useNavigate();
  const toast = useToast();

  const [cases,          setCases]          = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deleteId,       setDeleteId]       = useState<string | null>(null);
  const [deleting,       setDeleting]       = useState(false);

  const canEdit = user?.role === "TESTER" || user?.role === "ADMIN";

  const load = () => {
    if (!projectId) return;
    setLoading(true);
    apiClient.get(`/api/projects/${projectId}/test-cases`)
      .then(r => { setCases(r.data.items || r.data.data || r.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);

  const filtered = cases.filter((tc: any) => {
    const matchSearch   = !search         || tc.title?.toLowerCase().includes(search.toLowerCase()) || tc.testCaseId?.toLowerCase().includes(search.toLowerCase());
    const matchStatus   = !statusFilter   || tc.status   === statusFilter;
    const matchPriority = !priorityFilter || tc.priority === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const handleClone = async (id: string) => {
    try {
      await apiClient.post(`/api/projects/${projectId}/test-cases/${id}/clone`);
      toast.success("Test case cloned"); load();
    } catch { toast.error("Failed to clone"); }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await apiClient.delete(`/api/projects/${projectId}/test-cases/${id}`);
      setCases(prev => prev.filter(tc => tc.id !== id));
      setDeleteId(null);
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const sevColor = (s: string) =>
    s === "BLOCKER" || s === "CRITICAL" ? "red" : s === "MAJOR" ? "orange" : "gray";

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test Cases</h1>
          <p className="page-subtitle">{cases.length} total test cases</p>
        </div>
        {canEdit && (
          <Button icon="+" onClick={() => nav(`/projects/${projectId}/test-cases/new`)}>New Test Case</Button>
        )}
      </div>

      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title or ID..." />
        <Select value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses" options={[
          { value: "DRAFT",            label: "Draft" },
          { value: "READY_FOR_REVIEW", label: "Ready for Review" },
          { value: "APPROVED",         label: "Approved" },
          { value: "DEPRECATED",       label: "Deprecated" },
        ]} />
        <Select value={priorityFilter} onChange={setPriorityFilter} placeholder="All Priorities" options={[
          { value: "CRITICAL", label: "Critical" }, { value: "HIGH",   label: "High" },
          { value: "MEDIUM",   label: "Medium" },   { value: "LOW",    label: "Low" },
        ]} />
        {(search || statusFilter || priorityFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); }}>Clear</Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="✎" title="No test cases found"
          desc={search ? "Try adjusting your filters" : "Create your first test case to get started"}
          action={canEdit ? <Button onClick={() => nav(`/projects/${projectId}/test-cases/new`)}>Create Test Case</Button> : undefined}
        />
      ) : (
        <div style={{
          background: "rgba(14,17,35,0.7)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
          backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        }}>
          {/* ✅ No whitespace nodes inside colgroup — each col on one line, no comments between tags */}
          <table className="tt-table" style={{ tableLayout: "fixed", width: "100%" }}>
            <colgroup><col style={{ width: 100 }} /><col /><col style={{ width: 110 }} /><col style={{ width: 86 }} /><col style={{ width: 86 }} /><col style={{ width: 106 }} /><col style={{ width: 150 }} /></colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Module</th>
                <th>Priority</th>
                <th>Severity</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tc => (
                <tr key={tc.id}>
                  <td>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--text-muted)",
                      background: "rgba(255,255,255,0.04)", padding: "2px 6px", borderRadius: 4,
                      display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {tc.testCaseId || tc.id?.slice(0, 8)}
                    </span>
                  </td>
                  <td style={{ overflow: "hidden" }}>
                    <Link
                      to={`/projects/${projectId}/test-cases/${tc.id}`}
                      style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 500, fontSize: "0.84rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--accent)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"; }}
                    >
                      {tc.title}
                    </Link>
                    {/* Type + tags as a compact sub-line */}
                    <div style={{ display: "flex", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
                      {tc.type && (
                        <span style={{ fontSize: "0.64rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", background: "rgba(255,255,255,0.04)", padding: "1px 5px", borderRadius: 3 }}>
                          {tc.type}
                        </span>
                      )}
                      {tc.tags?.slice(0, 1).map((t: string) => <Badge key={t} color="blue">{t}</Badge>)}
                      {tc.tags?.length > 1 && <span style={{ fontSize: "0.64rem", color: "var(--text-muted)" }}>+{tc.tags.length - 1}</span>}
                    </div>
                  </td>
                  <td style={{ overflow: "hidden" }}>
                    <span style={{ color: "var(--text-secondary)", fontSize: "0.78rem", background: "rgba(255,255,255,0.03)", padding: "2px 7px", borderRadius: 4, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {tc.module || "—"}
                    </span>
                  </td>
                  <td><PriorityBadge value={tc.priority} /></td>
                  <td><Badge color={sevColor(tc.severity) as any}>{tc.severity}</Badge></td>
                  <td><StatusBadge value={tc.status} /></td>
                  <td>
                    {/* ✅ Tighter actions — icon buttons to save space */}
                    <div style={{ display: "flex", gap: 3, justifyContent: "flex-end", alignItems: "center" }}>
                      <button
                        onClick={() => nav(`/projects/${projectId}/test-cases/${tc.id}`)}
                        title="View"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.75rem", transition: "all var(--transition)" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                      >
                        View
                      </button>
                      {canEdit && tc.status === "APPROVED" && (
                        <button
                          onClick={() => nav(`/projects/${projectId}/executions/${tc.id}`)}
                          title="Run"
                          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "var(--success)", fontSize: "0.75rem", transition: "all var(--transition)" }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.2)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,185,129,0.1)"; }}
                        >
                          ▷
                        </button>
                      )}
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleClone(tc.id)}
                            title="Clone"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "var(--text-muted)", fontSize: "0.75rem", transition: "all var(--transition)" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                          >
                            ⎘
                          </button>
                          <button
                            onClick={() => setDeleteId(tc.id)}
                            title="Delete"
                            style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.25)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "var(--danger)", fontSize: "0.75rem", transition: "all var(--transition)" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,63,94,0.18)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,63,94,0.08)"; }}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) handleDelete(deleteId); }}
        title="Delete Test Case"
        message="Are you sure you want to delete this test case? This action can be undone by an admin."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
      />
    </div>
  );
};
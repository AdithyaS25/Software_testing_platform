import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, Badge, PriorityBadge, StatusBadge, SearchInput, Select, EmptyState, ConfirmDialog, useToast, Spinner } from "../../../shared/components/ui";
import { useParams } from "react-router-dom";

export const TestCasesPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const canEdit = user?.role === "TESTER" || user?.role === "ADMIN";

  const load = () => {
  if (!projectId) return;
  setLoading(true);
  apiClient
    .get(`/api/projects/${projectId}/test-cases`)
    .then((r) => {
      setCases(r.data.data || r.data || []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
};

useEffect(() => {
  load();
}, [projectId]);

const filtered = cases.filter((tc: any) => {
  const matchSearch =
    !search ||
    tc.title?.toLowerCase().includes(search.toLowerCase()) ||
    tc.testCaseId?.toLowerCase().includes(search.toLowerCase());

  const matchStatus = !statusFilter || tc.status === statusFilter;
  const matchPriority = !priorityFilter || tc.priority === priorityFilter;

  return matchSearch && matchStatus && matchPriority;
});

const handleClone = async (id: string) => {
  if (!projectId) return;
  try {
    await apiClient.post(
      `/api/projects/${projectId}/test-cases/${id}/clone`
    );
    toast.success("Test case cloned successfully");
    load();
  } catch {
    toast.error("Failed to clone test case");
  }
};

const handleDelete = async (id: string) => {
  try {
    await apiClient.delete(`/api/projects/${projectId}/test-cases/${id}`);
    toast.success("Test case deleted");
    load(); // ← ADD THIS LINE (or fetchTestCases() / whatever your load function is named)
  } catch {
    toast.error("Failed to delete");
  }
};

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Test Cases</h1>
          <p className="page-subtitle">{cases.length} total test cases</p>
        </div>
        {canEdit && (
          <Button icon="+" onClick={() => nav(`/projects/${projectId}/test-cases/new`)}>New Test Case</Button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by title or ID..." />
        <Select value={statusFilter} onChange={setStatusFilter} placeholder="All Statuses" options={[
          { value: "DRAFT", label: "Draft" }, { value: "READY_FOR_REVIEW", label: "Ready for Review" },
          { value: "APPROVED", label: "Approved" }, { value: "DEPRECATED", label: "Deprecated" }, { value: "ARCHIVED", label: "Archived" },
        ]} />
        <Select value={priorityFilter} onChange={setPriorityFilter} placeholder="All Priorities" options={[
          { value: "CRITICAL", label: "Critical" }, { value: "HIGH", label: "High" },
          { value: "MEDIUM", label: "Medium" }, { value: "LOW", label: "Low" },
        ]} />
        {(search || statusFilter || priorityFilter) && (
          <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setStatusFilter(""); setPriorityFilter(""); }}>Clear filters</Button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="✎" title="No test cases found" desc={search ? "Try adjusting your filters" : "Create your first test case to get started"} action={canEdit ? <Button onClick={() => nav(`/projects/${projectId}/test-cases/new`)}>Create Test Case</Button> : undefined} />
      ) : (
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
          <table className="tt-table">
            <thead>
              <tr>
                <th>ID</th><th>Title</th><th>Module</th><th>Priority</th><th>Severity</th>
                <th>Status</th><th>Type</th><th>Tags</th><th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tc => (
                <tr key={tc.id}>
                  <td><span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)" }}>{tc.testCaseId || tc.id?.slice(0, 8)}</span></td>
                  <td>
                    <Link to={`/projects/${projectId}/test-cases/${tc.id}`} style={{ color: "var(--text-primary)", textDecoration: "none", fontWeight: 500 }}
                      onMouseEnter={e => (e.currentTarget).style.color = "var(--accent)"}
                      onMouseLeave={e => (e.currentTarget).style.color = "var(--text-primary)"}
                    >
                      {tc.title}
                    </Link>
                  </td>
                  <td><span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{tc.module || "—"}</span></td>
                  <td><PriorityBadge value={tc.priority} /></td>
                  <td><Badge color={tc.severity === "BLOCKER" || tc.severity === "CRITICAL" ? "red" : tc.severity === "MAJOR" ? "orange" : "gray"}>{tc.severity}</Badge></td>
                  <td><StatusBadge value={tc.status} /></td>
                  <td><span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{tc.type}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {tc.tags?.slice(0, 2).map((t: string) => <Badge key={t} color="blue">{t}</Badge>)}
                      {tc.tags?.length > 2 && <Badge color="gray">+{tc.tags.length - 2}</Badge>}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      <Button variant="ghost" size="sm" onClick={() => nav(`/projects/${projectId}/test-cases/${tc.id}`)}>View</Button>
                      {canEdit && (
                        <>
                          {tc.status === "APPROVED" && (
                            <Button variant="secondary" size="sm" onClick={() => nav(`/projects/${projectId}/executions/${tc.id}`)}>▷ Run</Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleClone(tc.id)}>Clone</Button>
                          <Button variant="danger" size="sm" onClick={() => setDeleteId(tc.id)}>Delete</Button>
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

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => {if (deleteId) handleDelete(deleteId);}} title="Delete Test Case" message="Are you sure you want to delete this test case? This action can be undone by an admin." confirmLabel="Delete" />
    </div>
  );
};

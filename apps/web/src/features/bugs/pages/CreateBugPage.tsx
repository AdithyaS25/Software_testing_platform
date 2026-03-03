import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { Button, FormField, useToast } from "../../../shared/components/ui";

export const CreateBugPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const nav = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    severity: "MAJOR",
    priority: "P3_MEDIUM",
    environment: "",
    affectedVersion: "",
  });

  const setField = (k: string) => (e: any) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;

    setLoading(true);
    try {
      await apiClient.post(`/api/projects/${projectId}/bugs`, form);
      toast.success("Bug created successfully");
      nav(`/projects/${projectId}/bugs`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to create bug"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 800 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Bug</h1>
          <p className="page-subtitle">
            Report a new defect in this project
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: 24,
            marginBottom: 16,
          }}
        >
          <FormField label="Title" required>
            <input
              value={form.title}
              onChange={setField("title")}
              required
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              value={form.description}
              onChange={setField("description")}
              rows={3}
              required
            />
          </FormField>

          <FormField label="Steps to Reproduce">
            <textarea
              value={form.stepsToReproduce}
              onChange={setField("stepsToReproduce")}
              rows={3}
            />
          </FormField>

          <FormField label="Expected Behavior">
            <textarea
              value={form.expectedBehavior}
              onChange={setField("expectedBehavior")}
              rows={2}
            />
          </FormField>

          <FormField label="Actual Behavior">
            <textarea
              value={form.actualBehavior}
              onChange={setField("actualBehavior")}
              rows={2}
            />
          </FormField>

          <FormField label="Environment">
            <input
              value={form.environment}
              onChange={setField("environment")}
            />
          </FormField>

          <FormField label="Affected Version">
            <input
              value={form.affectedVersion}
              onChange={setField("affectedVersion")}
            />
          </FormField>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => nav(`/projects/${projectId}/bugs`)}
          >
            Cancel
          </Button>
          <Button loading={loading} type="submit">
            Create Bug
          </Button>
        </div>
      </form>
    </div>
  );
};

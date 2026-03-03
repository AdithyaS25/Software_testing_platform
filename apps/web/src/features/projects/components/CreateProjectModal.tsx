// File: apps/web/src/features/projects/components/CreateProjectModal.tsx
import { useState } from "react";
import { apiClient } from "../../../lib/axios";

interface Props {
  onClose: () => void;
  onCreated: (project: any) => void;
}

export default function CreateProjectModal({ onClose, onCreated }: Props) {
  const [form, setForm]     = useState({ name: "", key: "", description: "" });
  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);

  const handleNameChange = (e: any) => {
    const name = e.target.value;
    const autoKey = name.toUpperCase().replace(/[^A-Z0-9\s]/g,"")
      .split(/\s+/).filter(Boolean).map((w: string) => w[0]).join("").slice(0, 6);
    setForm(p => ({ ...p, name, key: p.key || autoKey }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Project name is required"); return; }
    if (!form.key.trim())  { setError("Project key is required"); return; }
    if (!/^[A-Z]{2,6}$/.test(form.key)) { setError("Key must be 2–6 uppercase letters"); return; }
    setSaving(true);
    try {
      const res = await apiClient.post("/api/projects", {
        name: form.name.trim(), key: form.key.trim(),
        description: form.description.trim() || undefined,
      });
      onCreated(res.data.data || res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to create project");
    } finally { setSaving(false); }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg-surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 480,
        padding: 32, boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Create Project</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "4px 0 0" }}>Set up a new testing project</p>
          </div>
          <button onClick={onClose} style={{
            background: "var(--bg-elevated)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", color: "var(--text-muted)",
            width: 30, height: 30, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", fontSize: "0.9rem",
          }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              Project Name <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input value={form.name} onChange={handleNameChange} placeholder="e.g. Mobile App v2.0"
              autoFocus style={{ width: "100%", boxSizing: "border-box" }} />
          </div>

          {/* Key */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              Project Key <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              value={form.key}
              onChange={e => { setError(""); setForm(p => ({ ...p, key: e.target.value.toUpperCase().replace(/[^A-Z]/g,"").slice(0,6) })); }}
              placeholder="e.g. MAV" maxLength={6}
              style={{ width: "100%", boxSizing: "border-box", fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>
              2–6 uppercase letters. Prefix for IDs:{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}>{form.key || "MAV"}-001</span>
            </p>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              Description
            </label>
            <textarea value={form.description}
              onChange={e => { setError(""); setForm(p => ({ ...p, description: e.target.value })); }}
              placeholder="What is this project about?" rows={3}
              style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }} />
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-sm)", padding: "10px 14px", fontSize: "0.82rem", color: "var(--danger)" }}>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
            <button onClick={onClose} disabled={saving} style={{
              padding: "8px 18px", background: "var(--bg-elevated)",
              border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
              color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: 500,
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving} style={{
              padding: "8px 20px",
              background: saving ? "var(--bg-elevated)" : "var(--accent)",
              border: "none", borderRadius: "var(--radius-md)",
              color: saving ? "var(--text-muted)" : "#fff",
              fontSize: "0.875rem", fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "var(--font-sans)", minWidth: 130,
            }}>{saving ? "Creating…" : "Create Project"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
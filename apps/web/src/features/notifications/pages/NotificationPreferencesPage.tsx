import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi, type NotificationPreference } from "../api/notification.api";

interface PrefRow {
  label:   string;
  desc:    string;
  emailKey: keyof NotificationPreference;
  inAppKey: keyof NotificationPreference;
}

const PREF_ROWS: PrefRow[] = [
  {
    label:    "Bug Assigned",
    desc:     "When a bug is assigned to you",
    emailKey: "emailBugAssigned",
    inAppKey: "inAppBugAssigned",
  },
  {
    label:    "Bug Status Changed",
    desc:     "When a bug you reported or are assigned to changes status",
    emailKey: "emailBugStatusChanged",
    inAppKey: "inAppBugStatusChanged",
  },
  {
    label:    "Test Run Assigned",
    desc:     "When a test run is assigned to you",
    emailKey: "emailTestAssigned",
    inAppKey: "inAppTestAssigned",
  },
  {
    label:    "Comment Mention",
    desc:     "When someone @mentions you in a comment",
    emailKey: "emailCommentMention",
    inAppKey: "inAppCommentMention",
  },
  {
    label:    "Re-test Requested",
    desc:     "When a developer requests you to re-test a bug",
    emailKey: "emailRetestRequested",
    inAppKey: "inAppRetestRequested",
  },
];

const defaultPrefs: NotificationPreference = {
  emailBugAssigned: true,
  emailBugStatusChanged: true,
  emailTestAssigned: true,
  emailCommentMention: true,
  emailRetestRequested: true,
  inAppBugAssigned: true,
  inAppBugStatusChanged: true,
  inAppTestAssigned: true,
  inAppCommentMention: true,
  inAppRetestRequested: true,
};

export function NotificationPreferencesPage() {
  const nav = useNavigate();
  const [prefs,   setPrefs]   = useState<NotificationPreference>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  useEffect(() => {
    notificationApi.getPreferences()
      .then(setPrefs)
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof NotificationPreference) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const toggleAll = (channel: "email" | "inApp", value: boolean) => {
    setPrefs((p) => {
      const updated = { ...p };
      for (const row of PREF_ROWS) {
        const key = channel === "email" ? row.emailKey : row.inAppKey;
        updated[key] = value as never;
      }
      return updated;
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await notificationApi.updatePreferences(prefs);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const allEmailOn  = PREF_ROWS.every((r) => prefs[r.emailKey]);
  const allInAppOn  = PREF_ROWS.every((r) => prefs[r.inAppKey]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60, color: "var(--text-muted)" }}>
        Loading preferences…
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 680 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => nav("/notifications")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", fontSize: 18, padding: "4px 6px",
            borderRadius: "var(--radius-sm)", fontFamily: "var(--font-sans)",
          }}
        >
          ←
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Notification Preferences</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Choose which notifications you receive and how
          </p>
        </div>
      </div>

      {/* Table card */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}>
        {/* Column headers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 120px 120px",
          padding: "12px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-elevated)",
        }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Event
          </span>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Email
            </span>
            <br />
            <button
              onClick={() => toggleAll("email", !allEmailOn)}
              style={{ fontSize: "0.68rem", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", marginTop: 2 }}
            >
              {allEmailOn ? "Disable all" : "Enable all"}
            </button>
          </div>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              In-App
            </span>
            <br />
            <button
              onClick={() => toggleAll("inApp", !allInAppOn)}
              style={{ fontSize: "0.68rem", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", marginTop: 2 }}
            >
              {allInAppOn ? "Disable all" : "Enable all"}
            </button>
          </div>
        </div>

        {/* Rows */}
        {PREF_ROWS.map((row, i) => (
          <div
            key={row.emailKey}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px",
              padding: "16px 20px",
              borderBottom: i < PREF_ROWS.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: "0.875rem", color: "var(--text-primary)" }}>
                {row.label}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {row.desc}
              </p>
            </div>

            {/* Email toggle */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Toggle value={prefs[row.emailKey] as boolean} onChange={() => toggle(row.emailKey)} />
            </div>

            {/* In-app toggle */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Toggle value={prefs[row.inAppKey] as boolean} onChange={() => toggle(row.inAppKey)} />
            </div>
          </div>
        ))}
      </div>

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16, gap: 10, alignItems: "center" }}>
        {saved && (
          <span style={{ color: "#22c55e", fontSize: "0.85rem", fontWeight: 500 }}>
            ✓ Preferences saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "var(--accent)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-md)",
            padding: "9px 22px",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            fontFamily: "var(--font-sans)",
            transition: "opacity var(--transition)",
          }}
        >
          {saving ? "Saving…" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={onChange}
      style={{
        width: 40,
        height: 22,
        borderRadius: 999,
        background: value ? "var(--accent)" : "var(--border)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute",
        top: 3,
        left: value ? 20 : 3,
        width: 16,
        height: 16,
        borderRadius: "50%",
        background: "#fff",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}
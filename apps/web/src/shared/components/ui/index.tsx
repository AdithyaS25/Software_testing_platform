import React from "react";

// ─── Button ──────────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, ...props }: ButtonProps) => {
  const base = "inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-150 border select-none";

  const variants: Record<BtnVariant, string> = {
    primary:   "bg-accent border-accent text-white hover:bg-accent-hover shadow-sm",
    secondary: "bg-bg-elevated border-border text-text-primary hover:bg-bg-hover",
    ghost:     "bg-transparent border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary",
    danger:    "bg-danger-muted border-danger/30 text-danger hover:bg-danger hover:text-white",
    success:   "bg-success-muted border-success/30 text-success hover:bg-success hover:text-white",
  };

  const sizes: Record<BtnSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  const style: React.CSSProperties = {
    fontFamily: "var(--font-sans)",
    display: "inline-flex", alignItems: "center", gap: "6px",
    fontWeight: 500, borderRadius: "var(--radius-md)",
    border: "1px solid",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "all var(--transition)",
    whiteSpace: "nowrap",
    ...(variant === "primary" && { background: "var(--accent)", borderColor: "var(--accent)", color: "#fff", padding: size === "sm" ? "6px 12px" : size === "lg" ? "10px 20px" : "8px 16px", fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "0.95rem" : "0.875rem" }),
    ...(variant === "secondary" && { background: "var(--bg-elevated)", borderColor: "var(--border)", color: "var(--text-primary)", padding: size === "sm" ? "6px 12px" : size === "lg" ? "10px 20px" : "8px 16px", fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "0.95rem" : "0.875rem" }),
    ...(variant === "ghost" && { background: "transparent", borderColor: "transparent", color: "var(--text-secondary)", padding: size === "sm" ? "6px 12px" : size === "lg" ? "10px 20px" : "8px 16px", fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "0.95rem" : "0.875rem" }),
    ...(variant === "danger" && { background: "var(--danger-muted)", borderColor: "rgba(255,77,106,0.3)", color: "var(--danger)", padding: size === "sm" ? "6px 12px" : size === "lg" ? "10px 20px" : "8px 16px", fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "0.95rem" : "0.875rem" }),
    ...(variant === "success" && { background: "var(--success-muted)", borderColor: "rgba(34,201,142,0.3)", color: "var(--success)", padding: size === "sm" ? "6px 12px" : size === "lg" ? "10px 20px" : "8px 16px", fontSize: size === "sm" ? "0.75rem" : size === "lg" ? "0.95rem" : "0.875rem" }),
  };

  return (
    <button style={style} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeColor = "blue" | "green" | "yellow" | "red" | "purple" | "gray" | "orange";

interface BadgeProps { color?: BadgeColor; children: React.ReactNode; dot?: boolean; }

const badgeColors: Record<BadgeColor, { bg: string; text: string; border: string }> = {
  blue:   { bg: "var(--accent-muted)",   text: "var(--accent)",   border: "rgba(61,111,255,0.2)" },
  green:  { bg: "var(--success-muted)",  text: "var(--success)",  border: "rgba(34,201,142,0.2)" },
  yellow: { bg: "var(--warning-muted)",  text: "var(--warning)",  border: "rgba(245,166,35,0.2)" },
  red:    { bg: "var(--danger-muted)",   text: "var(--danger)",   border: "rgba(255,77,106,0.2)" },
  purple: { bg: "var(--purple-muted)",   text: "var(--purple)",   border: "rgba(168,85,247,0.2)" },
  gray:   { bg: "rgba(255,255,255,0.05)", text: "var(--text-secondary)", border: "var(--border)" },
  orange: { bg: "rgba(251,146,60,0.12)", text: "#fb923c",         border: "rgba(251,146,60,0.2)" },
};

export const Badge = ({ color = "gray", children, dot }: BadgeProps) => {
  const c = badgeColors[color];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "2px 8px", borderRadius: "100px",
      fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.03em",
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0 }} />}
      {children}
    </span>
  );
};

// ─── Priority / Severity / Status badge helpers ───────────────────────────────
export const PriorityBadge = ({ value }: { value: string }) => {
  const map: Record<string, BadgeColor> = { CRITICAL: "red", HIGH: "orange", MEDIUM: "yellow", LOW: "gray" };
  return <Badge color={map[value] || "gray"} dot>{value}</Badge>;
};

export const SeverityBadge = ({ value }: { value: string }) => {
  const map: Record<string, BadgeColor> = { BLOCKER: "red", CRITICAL: "red", MAJOR: "orange", MINOR: "yellow", TRIVIAL: "gray" };
  return <Badge color={map[value] || "gray"}>{value}</Badge>;
};

export const StatusBadge = ({ value }: { value: string }) => {
  const map: Record<string, BadgeColor> = {
    DRAFT: "gray", READY_FOR_REVIEW: "yellow", APPROVED: "green", DEPRECATED: "orange", ARCHIVED: "purple",
    NEW: "blue", OPEN: "yellow", IN_PROGRESS: "orange", FIXED: "green", VERIFIED: "green",
    CLOSED: "gray", REOPENED: "red", "WON'T FIX": "purple", DUPLICATE: "purple",
    PASS: "green", FAIL: "red", BLOCKED: "yellow", SKIPPED: "gray",
    PASSED: "green", FAILED: "red", COMPLETED: "blue", IN_PROGRESS_RUN: "orange",
  };
  return <Badge color={map[value] || "gray"} dot>{value?.replace(/_/g, " ")}</Badge>;
};

export const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, BadgeColor> = { ADMIN: "purple", DEVELOPER: "blue", TESTER: "green" };
  return <Badge color={map[role] || "gray"}>{role}</Badge>;
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20 }: { size?: number }) => (
  <span style={{
    display: "inline-block", width: size, height: size,
    border: `2px solid var(--border)`,
    borderTopColor: "var(--accent)",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
  }} />
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className, style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => (
  <div style={{
    background: "var(--bg-surface)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    ...style,
  }} className={className}>
    {children}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = "md" }:
  { open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: "sm" | "md" | "lg" | "xl" }) => {
  if (!open) return null;
  const maxW = { sm: 400, md: 560, lg: 760, xl: 960 }[size];
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: maxW, animation: "fadeIn 0.2s ease" }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem", lineHeight: 1, padding: "4px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── FormField ────────────────────────────────────────────────────────────────
export const FormField = ({ label, error, children, required }: { label: string; error?: string; children: React.ReactNode; required?: boolean }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 5, letterSpacing: "0.04em", textTransform: "uppercase" }}>
      {label}{required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: 4 }}>{error}</p>}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, desc, action }: { icon: string; title: string; desc?: string; action?: React.ReactNode }) => (
  <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
    <div style={{ fontSize: "2.5rem", marginBottom: 12, opacity: 0.35 }}>{icon}</div>
    <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: 6 }}>{title}</h3>
    {desc && <p style={{ fontSize: "0.85rem", marginBottom: 16 }}>{desc}</p>}
    {action}
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmLabel = "Confirm", variant = "danger" }:
  { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; variant?: "danger" | "primary" }) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 20 }}>{message}</p>
    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant={variant === "danger" ? "danger" : "primary"} onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </Modal>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export const Tabs = ({ tabs, active, onChange }: { tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }) => (
  <div style={{ display: "flex", gap: 2, borderBottom: "1px solid var(--border)", marginBottom: 20 }}>
    {tabs.map(tab => (
      <button key={tab.id} onClick={() => onChange(tab.id)} style={{
        padding: "9px 16px", fontSize: "0.875rem", fontWeight: 500,
        background: "none", border: "none", cursor: "pointer",
        color: active === tab.id ? "var(--text-primary)" : "var(--text-muted)",
        borderBottom: `2px solid ${active === tab.id ? "var(--accent)" : "transparent"}`,
        marginBottom: -1, transition: "all var(--transition)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        {tab.label}
        {tab.count !== undefined && (
          <span style={{ padding: "1px 6px", borderRadius: 10, fontSize: "0.7rem", background: active === tab.id ? "var(--accent-muted)" : "var(--bg-elevated)", color: active === tab.id ? "var(--accent)" : "var(--text-muted)" }}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const show = (msg: string, type: "success" | "error" | "info" = "info") => {
    const div = document.createElement("div");
    const colors = { success: "var(--success)", error: "var(--danger)", info: "var(--accent)" };
    div.style.cssText = `position:fixed;bottom:20px;right:20px;z-index:9999;background:var(--bg-elevated);border:1px solid var(--border);border-left:3px solid ${colors[type]};color:var(--text-primary);padding:12px 16px;border-radius:var(--radius-md);font-size:0.875rem;font-family:var(--font-sans);box-shadow:var(--shadow-lg);max-width:340px;animation:fadeIn 0.2s ease;`;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3500);
  };
  return { success: (m: string) => show(m, "success"), error: (m: string) => show(m, "error"), info: (m: string) => show(m, "info") };
};

// ─── SearchInput ──────────────────────────────────────────────────────────────
export const SearchInput = ({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
    <span style={{ position: "absolute", left: 10, color: "var(--text-muted)", fontSize: "0.85rem", pointerEvents: "none" }}>⌕</span>
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ paddingLeft: 30, minWidth: 220 }} />
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({ value, onChange, options, placeholder = "All" }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string }) => (
  <select value={value} onChange={e => onChange(e.target.value)}>
    <option value="">{placeholder}</option>
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, color = "blue", sub }: { label: string; value: string | number; icon: string; color?: BadgeColor; sub?: string }) => {
  const c = badgeColors[color];
  return (
    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</span>
        <span style={{ fontSize: "1.1rem", background: c.bg, borderRadius: "var(--radius-sm)", padding: "4px 7px" }}>{icon}</span>
      </div>
      <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 5 }}>{sub}</div>}
    </div>
  );
};

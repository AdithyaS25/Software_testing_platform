import React from 'react';

// ─── Button ──────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type BtnSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  disabled,
  style: externalStyle,
  ...props
}: ButtonProps) => {
  const base: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    transition: 'all var(--transition)',
    whiteSpace: 'nowrap',
    position: 'relative',
    overflow: 'hidden',
    letterSpacing: '0.01em',
  };

  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent) 0%, #5a35d9 100%)',
      borderColor: 'rgba(120,87,255,0.4)',
      color: '#fff',
      boxShadow:
        '0 4px 16px rgba(120,87,255,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
    },
    secondary: {
      background: 'rgba(22, 27, 55, 0.7)',
      borderColor: 'rgba(255,255,255,0.1)',
      color: 'var(--text-primary)',
      boxShadow:
        '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
      backdropFilter: 'blur(8px)',
    },
    ghost: {
      background: 'transparent',
      borderColor: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'rgba(255,79,109,0.1)',
      borderColor: 'rgba(255,79,109,0.3)',
      color: 'var(--danger)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
    success: {
      background: 'rgba(34,217,160,0.1)',
      borderColor: 'rgba(34,217,160,0.3)',
      color: 'var(--success)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
  };

  const sizes: Record<BtnSize, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '0.78rem' },
    md: { padding: '9px 18px', fontSize: '0.875rem' },
    lg: { padding: '12px 24px', fontSize: '0.95rem' },
  };

  const style: React.CSSProperties = {
    ...base,
    ...variants[variant],
    ...sizes[size],
    ...externalStyle,
  };

  return (
    <button
      style={style}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (disabled || loading) return;
        if (variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow =
            '0 8px 24px rgba(120,87,255,0.4), inset 0 1px 0 rgba(255,255,255,0.15)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.background = 'rgba(30, 37, 75, 0.9)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.background = 'rgba(120,87,255,0.08)';
          e.currentTarget.style.color = 'var(--text-primary)';
        } else if (variant === 'danger') {
          e.currentTarget.style.background = 'rgba(255,79,109,0.18)';
        } else if (variant === 'success') {
          e.currentTarget.style.background = 'rgba(34,217,160,0.18)';
        }
      }}
      onMouseLeave={(e) => {
        if (disabled || loading) return;
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = (style.boxShadow as string) || '';
        if (variant !== 'ghost') {
          e.currentTarget.style.background = (style.background as string) || '';
          e.currentTarget.style.borderColor =
            (style.borderColor as string) || '';
        } else {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
      {...props}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeColor =
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'purple'
  | 'gray'
  | 'orange'
  | 'cyan';

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  dot?: boolean;
}

const badgeColors: Record<
  BadgeColor,
  { bg: string; text: string; border: string; glow?: string }
> = {
  blue: {
    bg: 'rgba(120,87,255,0.12)',
    text: '#a082ff',
    border: 'rgba(120,87,255,0.25)',
    glow: 'rgba(120,87,255,0.2)',
  },
  green: {
    bg: 'rgba(34,217,160,0.1)',
    text: 'var(--success)',
    border: 'rgba(34,217,160,0.25)',
  },
  yellow: {
    bg: 'rgba(255,197,61,0.1)',
    text: 'var(--warning)',
    border: 'rgba(255,197,61,0.25)',
  },
  red: {
    bg: 'rgba(255,79,109,0.1)',
    text: 'var(--danger)',
    border: 'rgba(255,79,109,0.25)',
  },
  purple: {
    bg: 'rgba(192,132,252,0.1)',
    text: 'var(--purple)',
    border: 'rgba(192,132,252,0.25)',
  },
  gray: {
    bg: 'rgba(255,255,255,0.05)',
    text: 'var(--text-secondary)',
    border: 'rgba(255,255,255,0.1)',
  },
  orange: {
    bg: 'rgba(251,146,60,0.1)',
    text: '#fb923c',
    border: 'rgba(251,146,60,0.25)',
  },
  cyan: {
    bg: 'rgba(61,217,255,0.1)',
    text: 'var(--info)',
    border: 'rgba(61,217,255,0.25)',
  },
};

export const Badge = ({ color = 'gray', children, dot }: BadgeProps) => {
  const c = badgeColors[color] || badgeColors.gray;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 9px',
        borderRadius: '100px',
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-display)',
      }}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'currentColor',
            flexShrink: 0,
            boxShadow: `0 0 4px currentColor`,
          }}
        />
      )}
      {children}
    </span>
  );
};

// ─── Priority / Severity / Status badges ─────────────────────────────────────
export const PriorityBadge = ({ value }: { value: string }) => {
  const map: Record<string, BadgeColor> = {
    CRITICAL: 'red',
    HIGH: 'orange',
    MEDIUM: 'yellow',
    LOW: 'gray',
  };
  return (
    <Badge color={map[value] || 'gray'} dot>
      {value}
    </Badge>
  );
};

export const SeverityBadge = ({ value }: { value: string }) => {
  const map: Record<string, BadgeColor> = {
    BLOCKER: 'red',
    CRITICAL: 'red',
    MAJOR: 'orange',
    MINOR: 'yellow',
    TRIVIAL: 'gray',
  };
  return <Badge color={map[value] || 'gray'}>{value}</Badge>;
};

export const StatusBadge = ({ value }: { value: string }) => {
  const map: Record<string, BadgeColor> = {
    DRAFT: 'gray',
    READY_FOR_REVIEW: 'yellow',
    APPROVED: 'green',
    DEPRECATED: 'orange',
    ARCHIVED: 'purple',
    NEW: 'blue',
    OPEN: 'yellow',
    IN_PROGRESS: 'orange',
    FIXED: 'green',
    VERIFIED: 'green',
    CLOSED: 'gray',
    REOPENED: 'red',
    "WON'T FIX": 'purple',
    DUPLICATE: 'purple',
    PASS: 'green',
    FAIL: 'red',
    BLOCKED: 'yellow',
    SKIPPED: 'gray',
    PASSED: 'green',
    FAILED: 'red',
    COMPLETED: 'cyan',
    IN_PROGRESS_RUN: 'orange',
  };
  return (
    <Badge color={map[value] || 'gray'} dot>
      {value?.replace(/_/g, ' ')}
    </Badge>
  );
};

export const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, BadgeColor> = {
    ADMIN: 'purple',
    DEVELOPER: 'blue',
    TESTER: 'green',
  };
  return <Badge color={map[role] || 'gray'}>{role}</Badge>;
};

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 20 }: { size?: number }) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2px solid rgba(120,87,255,0.2)`,
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.65s linear infinite',
      flexShrink: 0,
      filter: 'drop-shadow(0 0 4px var(--accent-glow))',
    }}
  />
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={`glass-card ${className || ''}`}
    style={{
      padding: 20,
      ...style,
    }}
  >
    {children}
  </div>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
  if (!open) return null;
  const maxW = { sm: 400, md: 560, lg: 760, xl: 960 }[size];
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: maxW }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,79,109,0.1)';
              e.currentTarget.style.color = 'var(--danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── FormField ────────────────────────────────────────────────────────────────
export const FormField = ({
  label,
  error,
  children,
  required,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div style={{ marginBottom: 16 }}>
    <label
      style={{
        display: 'block',
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--text-secondary)',
        marginBottom: 7,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-display)',
      }}
    >
      {label}
      {required && (
        <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>
      )}
    </label>
    {children}
    {error && (
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--danger)',
          marginTop: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span>⚠</span> {error}
      </p>
    )}
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({
  icon,
  title,
  desc,
  action,
}: {
  icon: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) => (
  <div
    style={{
      textAlign: 'center',
      padding: '70px 20px',
      background: 'rgba(255,255,255,0.015)',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: 'var(--radius-xl)',
    }}
  >
    <div
      style={{
        fontSize: '3rem',
        marginBottom: 16,
        opacity: 0.4,
        filter: 'drop-shadow(0 0 20px var(--accent-glow))',
      }}
    >
      {icon}
    </div>
    <h3
      style={{
        fontSize: '1rem',
        fontFamily: 'var(--font-display)',
        color: 'var(--text-secondary)',
        marginBottom: 8,
        fontWeight: 600,
      }}
    >
      {title}
    </h3>
    {desc && (
      <p
        style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          marginBottom: 20,
        }}
      >
        {desc}
      </p>
    )}
    {action}
  </div>
);

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'primary';
}) => (
  <Modal open={open} onClose={onClose} title={title} size="sm">
    <p
      style={{
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        marginBottom: 24,
        lineHeight: 1.7,
      }}
    >
      {message}
    </p>
    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export const Tabs = ({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) => (
  <div
    style={{
      display: 'flex',
      gap: 4,
      borderBottom: '1px solid var(--border-subtle)',
      marginBottom: 24,
      padding: '4px 4px 0',
    }}
  >
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        style={{
          padding: '9px 18px',
          fontSize: '0.85rem',
          fontWeight: active === tab.id ? 700 : 500,
          fontFamily: 'var(--font-display)',
          background: active === tab.id ? 'rgba(120,87,255,0.1)' : 'none',
          border: '1px solid',
          borderColor:
            active === tab.id ? 'rgba(120,87,255,0.25)' : 'transparent',
          borderBottom:
            active === tab.id
              ? '1px solid var(--accent)'
              : '1px solid transparent',
          borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
          cursor: 'pointer',
          color:
            active === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
          marginBottom: -1,
          transition: 'all var(--transition)',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
        }}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span
            style={{
              padding: '1px 7px',
              borderRadius: '100px',
              fontSize: '0.68rem',
              background:
                active === tab.id
                  ? 'rgba(120,87,255,0.2)'
                  : 'rgba(255,255,255,0.06)',
              color: active === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: 700,
            }}
          >
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
export const useToast = () => {
  const show = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    const div = document.createElement('div');
    const colors = {
      success: { border: 'var(--success)', glow: 'rgba(34,217,160,0.2)' },
      error: { border: 'var(--danger)', glow: 'rgba(255,79,109,0.2)' },
      info: { border: 'var(--accent)', glow: 'rgba(120,87,255,0.2)' },
    };
    const c = colors[type];
    div.style.cssText = `
      position: fixed;
      bottom: 24px; right: 24px;
      z-index: 9999;
      background: rgba(14,17,35,0.95);
      border: 1px solid rgba(255,255,255,0.08);
      border-left: 3px solid ${c.border};
      color: var(--text-primary);
      padding: 14px 18px;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-family: var(--font-sans);
      box-shadow: 0 16px 48px rgba(0,0,0,0.5), 0 0 30px ${c.glow};
      max-width: 360px;
      animation: fadeIn 0.3s ease;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    `;
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => {
      div.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => div.remove(), 300);
    }, 3200);
  };
  return {
    success: (m: string) => show(m, 'success'),
    error: (m: string) => show(m, 'error'),
    info: (m: string) => show(m, 'info'),
  };
};

// ─── SearchInput ──────────────────────────────────────────────────────────────
export const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div
    style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
    }}
  >
    <span
      style={{
        position: 'absolute',
        left: 12,
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        pointerEvents: 'none',
      }}
    >
      ⌕
    </span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ paddingLeft: 34, minWidth: 240 }}
    />
  </div>
);

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({
  value,
  onChange,
  options,
  placeholder = 'All',
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}>
    <option value="">{placeholder}</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>
        {o.label}
      </option>
    ))}
  </select>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({
  label,
  value,
  icon,
  color = 'blue',
  sub,
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: BadgeColor;
  sub?: string;
}) => {
  const c = badgeColors[color] || badgeColors.blue;
  return (
    <div
      className="card-3d shine"
      style={{
        background: 'rgba(14, 17, 35, 0.8)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 22px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Glow orb */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: c.bg,
          filter: 'blur(20px)',
          opacity: 0.6,
        }}
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
          position: 'relative',
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '1.1rem',
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: 'var(--radius-sm)',
            padding: '6px 9px',
            boxShadow: `0 0 12px ${c.glow || c.border}`,
          }}
        >
          {icon}
        </span>
      </div>

      <div
        style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          fontFamily: 'var(--font-display)',
          position: 'relative',
        }}
      >
        {value}
      </div>

      {sub && (
        <div
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: 7,
          }}
        >
          {sub}
        </div>
      )}

      {/* Bottom gradient line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${c.text}, transparent)`,
          opacity: 0.4,
        }}
      />
    </div>
  );
};

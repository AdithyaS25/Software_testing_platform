import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, FormField } from "../../../shared/components/ui";

export const LoginPage = () => {
  const { login } = useAuth();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
            margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.6rem", fontWeight: 900, color: "#fff",
            boxShadow: "0 8px 32px rgba(120,87,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
            fontFamily: "var(--font-display)",
            animation: "float 4s ease-in-out infinite",
          }}>T</div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.8rem", fontWeight: 800,
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #eef0ff 0%, var(--accent-2) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 6,
          }}>TestTrack Pro</h1>

          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(14, 17, 35, 0.85)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--radius-xl)",
          padding: "36px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Top shimmer line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(120,87,255,0.8), rgba(61,217,255,0.5), transparent)",
          }} />

          {/* Inner corner glow */}
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 150, height: 150,
            background: "radial-gradient(circle, rgba(120,87,255,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />

          {error && (
            <div style={{
              background: "rgba(255,79,109,0.08)",
              border: "1px solid rgba(255,79,109,0.25)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              color: "var(--danger)",
              fontSize: "0.85rem",
              marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <FormField label="Email Address" required>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required autoComplete="email"
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                style={{
                  boxShadow: focused === "email" ? "0 0 0 3px rgba(120,87,255,0.15), 0 0 20px rgba(120,87,255,0.08)" : undefined,
                }}
              />
            </FormField>

            <FormField label="Password" required>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required autoComplete="current-password"
                  style={{
                    paddingRight: 50,
                    boxShadow: focused === "pass" ? "0 0 0 3px rgba(120,87,255,0.15), 0 0 20px rgba(120,87,255,0.08)" : undefined,
                  }}
                  onFocus={() => setFocused("pass")}
                  onBlur={() => setFocused(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    color: "var(--text-muted)", cursor: "pointer",
                    fontSize: "0.78rem", fontFamily: "var(--font-sans)",
                    padding: "2px 6px",
                    borderRadius: 4,
                    transition: "color var(--transition)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "var(--text-primary)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </FormField>

            <div style={{ textAlign: "right", marginTop: -6, marginBottom: 22 }}>
              <Link to="/forgot-password" style={{
                fontSize: "0.8rem",
                color: "var(--accent)",
                textDecoration: "none",
                opacity: 0.85,
                transition: "opacity var(--transition)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              size="lg"
              style={{ width: "100%", justifyContent: "center", letterSpacing: "0.02em" }}
            >
              Sign In →
            </Button>
          </form>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{
              color: "var(--accent-2)", textDecoration: "none", fontWeight: 600,
              fontFamily: "var(--font-display)",
            }}>
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

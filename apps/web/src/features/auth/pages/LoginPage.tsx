import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";
import { Button, FormField } from "../../../shared/components/ui";

export const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

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
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "var(--accent)", margin: "0 auto 12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", fontWeight: 800, color: "#fff",
            boxShadow: "0 0 30px var(--accent-glow)",
          }}>T</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>TestTrack Pro</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "28px 32px",
          boxShadow: "var(--shadow-lg)",
        }}>
          {error && (
            <div style={{
              background: "var(--danger-muted)", border: "1px solid rgba(255,77,106,0.25)",
              borderRadius: "var(--radius-sm)", padding: "10px 12px",
              color: "var(--danger)", fontSize: "0.85rem", marginBottom: 16,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <FormField label="Email Address" required>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required autoComplete="email"
              />
            </FormField>

            <FormField label="Password" required>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.8rem",
                }}>{showPass ? "Hide" : "Show"}</button>
              </div>
            </FormField>

            <div style={{ textAlign: "right", marginTop: -6, marginBottom: 18 }}>
              <Link to="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--accent)", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} size="lg" style={{ width: "100%", justifyContent: "center" }}>
              Sign In
            </Button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

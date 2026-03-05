import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { Button, FormField, useToast } from "../../../shared/components/ui";

export const RegisterPage = () => {
  const nav   = useNavigate();
  const toast = useToast();
  const [form,    setForm]    = useState({ email: "", password: "", role: "TESTER" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await apiClient.post("/api/auth/register", form);
      toast.success("Account created! Please check your email to verify.");
      nav("/login");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  const roleOptions = [
    { value: "TESTER",    label: "🧪 Tester",    desc: "Run tests, file bugs, write test cases" },
    { value: "DEVELOPER", label: "⚡ Developer",  desc: "Fix bugs, update statuses, view reports" },
    { value: "ADMIN",     label: "🛡 Admin",       desc: "Full access to all features" },
  ];

  return (
    <div className="auth-bg">
      <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
            margin: "0 auto 14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", fontWeight: 900, color: "#fff",
            boxShadow: "0 8px 32px rgba(120,87,255,0.5), inset 0 1px 0 rgba(255,255,255,0.3)",
            fontFamily: "var(--font-display)",
            animation: "float 4s ease-in-out infinite",
          }}>T</div>

          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.7rem", fontWeight: 800,
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #eef0ff 0%, var(--accent-2) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: 6,
          }}>Create Account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Join your testing workspace</p>
        </div>

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
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(120,87,255,0.8), rgba(61,217,255,0.5), transparent)",
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

          <form onSubmit={handleSubmit}>
            <FormField label="Email Address" required>
              <input
                type="email" value={form.email}
                onChange={set("email")}
                placeholder="you@company.com" required
              />
            </FormField>

            <FormField label="Password" required>
              <input
                type="password" value={form.password}
                onChange={set("password")}
                placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special" required
              />
            </FormField>

            {/* Role selector - visual cards */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontSize: "0.72rem", fontWeight: 700,
                color: "var(--text-secondary)", marginBottom: 10,
                letterSpacing: "0.07em", textTransform: "uppercase",
                fontFamily: "var(--font-display)",
              }}>
                Your Role <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {roleOptions.map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => setForm(p => ({ ...p, role: opt.value }))}
                    style={{
                      padding: "12px 16px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid",
                      borderColor: form.role === opt.value ? "rgba(120,87,255,0.4)" : "rgba(255,255,255,0.07)",
                      background: form.role === opt.value
                        ? "linear-gradient(135deg, rgba(120,87,255,0.12) 0%, rgba(61,217,255,0.05) 100%)"
                        : "rgba(255,255,255,0.02)",
                      cursor: "pointer",
                      transition: "all var(--transition)",
                      display: "flex", alignItems: "center", gap: 12,
                      boxShadow: form.role === opt.value ? "0 0 20px rgba(120,87,255,0.08)" : "none",
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: form.role === opt.value
                        ? "linear-gradient(135deg, var(--accent), var(--accent-2))"
                        : "rgba(255,255,255,0.15)",
                      flexShrink: 0,
                      boxShadow: form.role === opt.value ? "0 0 8px var(--accent-glow)" : "none",
                      transition: "all var(--transition)",
                    }} />
                    <div>
                      <div style={{
                        fontSize: "0.875rem", fontWeight: form.role === opt.value ? 700 : 500,
                        color: form.role === opt.value ? "var(--text-primary)" : "var(--text-secondary)",
                        fontFamily: "var(--font-display)",
                      }}>{opt.label}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 1 }}>{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              size="lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            >
              Create Account →
            </Button>
          </form>

          <div style={{ textAlign: "center", marginTop: 22, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{
              color: "var(--accent-2)", textDecoration: "none",
              fontWeight: 600, fontFamily: "var(--font-display)",
            }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

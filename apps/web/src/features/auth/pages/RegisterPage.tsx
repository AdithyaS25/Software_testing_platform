import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "../../../lib/axios";
import { Button, FormField, useToast } from "../../../shared/components/ui";

export const RegisterPage = () => {
  const nav = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "", role: "TESTER" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="auth-bg">
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--accent)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: "#fff", boxShadow: "0 0 30px var(--accent-glow)" }}>T</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Create Account</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>Join your testing workspace</p>
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "28px 32px", boxShadow: "var(--shadow-lg)" }}>
          {error && <div style={{ background: "var(--danger-muted)", border: "1px solid rgba(255,77,106,0.25)", borderRadius: "var(--radius-sm)", padding: "10px 12px", color: "var(--danger)", fontSize: "0.85rem", marginBottom: 16 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <FormField label="Email Address" required>
              <input type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" required />
            </FormField>
            <FormField label="Password" required>
              <input type="password" value={form.password} onChange={set("password")} placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special" required />
            </FormField>
            <FormField label="Role" required>
              <select value={form.role} onChange={set("role")}>
                <option value="TESTER">Tester</option>
                <option value="DEVELOPER">Developer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </FormField>
            <Button type="submit" loading={loading} size="lg" style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              Create Account
            </Button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../../lib/axios';
import { Button, FormField } from '../../../shared/components/ui';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'var(--accent)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            T
          </div>
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            Reset Password
          </h1>
        </div>
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
          }}
        >
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>📧</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                Reset link sent! Check your inbox.
              </p>
              <Link
                to="/login"
                style={{
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div
                  style={{
                    background: 'var(--danger-muted)',
                    border: '1px solid rgba(255,77,106,0.25)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '10px 12px',
                    color: 'var(--danger)',
                    fontSize: '0.85rem',
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.875rem',
                  marginBottom: 18,
                }}
              >
                Enter your email and we'll send a reset link.
              </p>
              <form onSubmit={handleSubmit}>
                <FormField label="Email Address" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                  />
                </FormField>
                <Button
                  type="submit"
                  loading={loading}
                  size="lg"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    marginTop: 8,
                  }}
                >
                  Send Reset Link
                </Button>
              </form>
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Link
                  to="/login"
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                  }}
                >
                  ← Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

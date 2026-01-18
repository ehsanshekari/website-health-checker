import { useState } from 'react';
import type { LoginRequest, LoginResponse } from './types';

const API_URL = import.meta.env.VITE_STATUS_API_URL?.replace('/api/status', '') || '';

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestBody: LoginRequest = { username, password };
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const loginResponse = data as LoginResponse;
      
      // Store token in localStorage
      localStorage.setItem('authToken', loginResponse.token);
      onLoginSuccess(loginResponse.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: 0, marginBottom: 8, textAlign: 'center' }}>Website Monitoring</h1>
        <p style={{ margin: 0, marginBottom: 24, color: '#64748b', textAlign: 'center' }}>
          Sign in to continue
        </p>

        {error && (
          <div
            style={{
              padding: 12,
              marginBottom: 16,
              borderRadius: 4,
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              disabled={loading}
              required
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              required
              style={inputStyle}
            />
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 16, marginBottom: 0 }}>
          Demo credentials: withsecure / isscure
        </p>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  backgroundColor: '#f1f5f9',
  fontFamily: 'system-ui, Arial, sans-serif',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: 32,
  borderRadius: 8,
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  width: '100%',
  maxWidth: 400,
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: '#334155',
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  border: '1px solid #cbd5e1',
  borderRadius: 4,
  fontSize: 14,
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  marginTop: 8,
};

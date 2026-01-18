import { useEffect, useMemo, useState, useCallback } from 'react';
import type { StatusItem, StatusResponse } from './types';
import Settings from './Settings';
import Login from './Login';

const API_URL = import.meta.env.VITE_STATUS_API_URL as string | undefined;

function formatDate(iso?: string) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString();
}

function statusColor(status: string) {
  switch (status) {
    case 'success':
      return '#16a34a';
    case 'content_error':
      return '#ca8a04';
    default:
      return '#dc2626';
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard');
  const [data, setData] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => Boolean(API_URL), []);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  function handleLoginSuccess(_token: string) {
    setIsAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const fetchData = useCallback(async () => {
    if (!API_URL) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { method: 'GET' });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = (await res.json()) as StatusResponse;
      setData(json.items ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentPage === 'dashboard') {
      fetchData();
      const id = setInterval(fetchData, 30_000);
      return () => clearInterval(id);
    }
  }, [currentPage, fetchData]);

  if (currentPage === 'settings') {
    return (
      <div>
        <nav style={navStyle}>
          <button onClick={() => setCurrentPage('dashboard')} style={navButtonStyle}>
            Dashboard
          </button>
          <button onClick={() => setCurrentPage('settings')} style={activeNavButtonStyle}>
            Settings
          </button>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </nav>
        <Settings />
      </div>
    );
  }

  return (
    <div>
      <nav style={navStyle}>
        <button onClick={() => setCurrentPage('dashboard')} style={activeNavButtonStyle}>
          Dashboard
        </button>
        <button onClick={() => setCurrentPage('settings')} style={navButtonStyle}>
          Settings
        </button>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
      </nav>
      <div style={{ fontFamily: 'system-ui, Arial, sans-serif', padding: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 4 }}>Website Monitoring</h1>
        <p style={{ marginTop: 0, color: '#475569' }}>
          {API_URL ? 'Live from CloudWatch Logs' : 'Set VITE_STATUS_API_URL to enable fetching'}
        </p>

        <div style={{ marginBottom: 12 }}>
          <button onClick={fetchData} disabled={!canFetch || loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div style={{ color: '#dc2626', marginBottom: 12 }}>Error: {error}</div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: 600, width: '100%' }}>
            <thead>
              <tr>
                <th style={thStyle}>Website</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Response Time (ms)</th>
                <th style={thStyle}>Last Checked</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.url}>
                  <td style={tdStyle}>{item.url}</td>
                  <td style={{ ...tdStyle, color: statusColor(item.status), fontWeight: 600 }}>
                    {item.status}
                  </td>
                  <td style={tdStyle}>{item.responseTimeMs ?? '-'}</td>
                  <td style={tdStyle}>{formatDate(item.lastCheck)}</td>
                </tr>
              ))}
              {!loading && data.length === 0 && (
                <tr>
                  <td style={tdStyle} colSpan={4}>
                    No data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  padding: '12px 24px',
  backgroundColor: '#f8fafc',
  borderBottom: '1px solid #cbd5e1',
};

const navButtonStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  color: '#64748b',
};

const activeNavButtonStyle: React.CSSProperties = {
  ...navButtonStyle,
  color: '#2563eb',
  borderBottom: '2px solid #2563eb',
};

const logoutButtonStyle: React.CSSProperties = {
  ...navButtonStyle,
  marginLeft: 'auto',
  color: '#dc2626',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  borderBottom: '1px solid #cbd5e1',
  padding: '8px 12px',
  background: '#f8fafc',
};

const tdStyle: React.CSSProperties = {
  borderBottom: '1px solid #e5e7eb',
  padding: '8px 12px',
};

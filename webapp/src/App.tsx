import { useEffect, useMemo, useState } from 'react';
import type { StatusItem, StatusResponse } from './types';

const API_URL = import.meta.env.VITE_STATUS_API_URL as string | undefined;

// const API_URL = 'https://1xst1kto5k.execute-api.eu-north-1.amazonaws.com/prod/api/status';

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
  const [data, setData] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = useMemo(() => Boolean(API_URL), []);

  async function fetchData() {
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
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
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
  );
}

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

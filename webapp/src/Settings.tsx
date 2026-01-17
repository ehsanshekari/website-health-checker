import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_STATUS_API_URL?.replace('/api/status', '') || '';

interface Website {
  id: string;
  url: string;
  contentRequirement: string;
  createdAt?: string;
}

export default function Settings() {
  const [intervalSeconds, setIntervalSeconds] = useState<number>(60);
  const [newInterval, setNewInterval] = useState<string>('60');
  const [websites, setWebsites] = useState<Website[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchInterval();
    fetchWebsites();
  }, []);

  async function fetchInterval() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/interval`);
      if (!res.ok) throw new Error('Failed to fetch interval');
      const data = await res.json();
      setIntervalSeconds(data.intervalSeconds);
      setNewInterval(String(data.intervalSeconds));
    } catch (err) {
      console.error('Failed to fetch interval:', err);
    }
  }

  async function fetchWebsites() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/websites`);
      if (!res.ok) throw new Error('Failed to fetch websites');
      const data = await res.json();
      setWebsites(data.websites);
    } catch (err) {
      console.error('Failed to fetch websites:', err);
    }
  }

  async function updateInterval() {
    setLoading(true);
    setMessage(null);
    try {
      const value = parseInt(newInterval, 10);
      if (value < 1 || value > 86400) {
        setMessage({ type: 'error', text: 'Interval must be between 1 and 86400 seconds' });
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/interval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalSeconds: value }),
      });

      if (!res.ok) throw new Error('Failed to update interval');
      
      const data = await res.json();
      setIntervalSeconds(data.intervalSeconds);
      setMessage({ type: 'success', text: 'Interval updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update' });
    } finally {
      setLoading(false);
    }
  }

  async function addWebsite() {
    setLoading(true);
    setMessage(null);
    try {
      if (!newUrl || !newContent) {
        setMessage({ type: 'error', text: 'URL and content requirement are required' });
        return;
      }

      const res = await fetch(`${API_BASE_URL}/api/admin/websites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, contentRequirement: newContent }),
      });

      if (!res.ok) throw new Error('Failed to add website');
      
      setMessage({ type: 'success', text: 'Website added successfully!' });
      setNewUrl('');
      setNewContent('');
      await fetchWebsites();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to add website' });
    } finally {
      setLoading(false);
    }
  }

  async function deleteWebsite(id: string) {
    if (!confirm('Are you sure you want to delete this website?')) return;
    
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/websites/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete website');
      
      setMessage({ type: 'success', text: 'Website deleted successfully!' });
      await fetchWebsites();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete website' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui, Arial, sans-serif', padding: 24, maxWidth: 1000 }}>
      <h1 style={{ margin: 0, marginBottom: 24 }}>Settings</h1>

      {message && (
        <div
          style={{
            padding: 12,
            marginBottom: 24,
            borderRadius: 4,
            backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: message.type === 'success' ? '#166534' : '#991b1b',
          }}
        >
          {message.text}
        </div>
      )}

      {/* Interval Configuration */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Check Interval</h2>
        <p style={{ marginTop: 0, marginBottom: 12, color: '#475569' }}>
          Current interval: <strong>{intervalSeconds} seconds</strong>
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="number"
            value={newInterval}
            onChange={(e) => setNewInterval(e.target.value)}
            placeholder="Seconds"
            min="1"
            max="86400"
            style={{
              padding: '8px 12px',
              border: '1px solid #cbd5e1',
              borderRadius: 4,
              width: 200,
            }}
          />
          <button
            onClick={updateInterval}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            Update Interval
          </button>
        </div>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
          Min: 1 second, Max: 86400 seconds (24 hours)
        </p>
      </section>

      {/* Websites Management */}
      <section>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>Websites</h2>
        
        {/* Add Website Form */}
        <div style={{ marginBottom: 24, padding: 16, backgroundColor: '#f8fafc', borderRadius: 4 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Add New Website</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.com"
              style={{
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
              }}
            />
            <input
              type="text"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Content to search for (e.g., 'google')"
              style={{
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 4,
              }}
            />
            <button
              onClick={addWebsite}
              disabled={loading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                alignSelf: 'flex-start',
              }}
            >
              Add Website
            </button>
          </div>
        </div>

        {/* Websites List */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Current Websites</h3>
          {websites.length === 0 ? (
            <p style={{ color: '#64748b' }}>No websites configured yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9' }}>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>URL</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>Content Requirement</th>
                  <th style={{ padding: 12, textAlign: 'center', borderBottom: '2px solid #cbd5e1' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((website) => (
                  <tr key={website.id}>
                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>{website.url}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0' }}>{website.contentRequirement}</td>
                    <td style={{ padding: 12, borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <button
                        onClick={() => deleteWebsite(website.id)}
                        disabled={loading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: 4,
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.6 : 1,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

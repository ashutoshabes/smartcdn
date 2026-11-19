import { useState, useEffect } from 'react';
import { Plus, Globe, Trash2, Pencil, X, Network, ShieldAlert, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const emptyForm = { domain: '', origin_server: '', protocol: 'HTTPS', cache_ttl: 3600 };

export default function Websites() {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
    const [healthResults, setHealthResults] = useState({});
  const [checkingHealth, setCheckingHealth] = useState({});
  const loadWebsites = async () => {
    setLoading(true);
    try {
      const res = await api.getWebsites();
      if (res.success) setWebsites(res.websites);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWebsites(); }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (site) => {
    setEditingId(site.id);
    setForm({
      domain: site.domain,
      origin_server: site.origin_server,
      protocol: site.protocol,
      cache_ttl: site.cache_ttl,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.updateWebsite(editingId, { ...form, status: 'active' });
      } else {
        await api.addWebsite(form);
      }
      setShowForm(false);
      await loadWebsites();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save website');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this website? This cannot be undone.')) return;
    await api.deleteWebsite(id);
    await loadWebsites();
  };
    const checkHealth = async (siteId) => {
    setCheckingHealth((prev) => ({ ...prev, [siteId]: true }));
    try {
      const res = await api.checkWebsiteHealth(siteId);
      setHealthResults((prev) => ({ ...prev, [siteId]: res }));
    } catch (err) {
      setHealthResults((prev) => ({ ...prev, [siteId]: { success: false, isUp: false } }));
    } finally {
      setCheckingHealth((prev) => ({ ...prev, [siteId]: false }));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <button className="btn btn-primary btn-sm" onClick={openAddForm}>
          <Plus size={15} /> Add Website
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 10 }} />)}
          </div>
        ) : websites.length === 0 ? (
          <div className="empty-state">
            <Globe size={30} color="var(--text-3)" style={{ marginBottom: 10 }} />
            <h4>No websites yet</h4>
            <p>Add your first website to start simulating CDN traffic for it.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Origin Server</th>
                <th>Status</th>
                <th>Requests</th>
                <th>Cache Ratio</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {websites.map((site) => (
                <tr key={site.id}>
                  <td style={{ color: 'var(--text-0)', fontWeight: 600 }}>{site.domain}</td>
                  <td className="mono" style={{ fontSize: 12.5 }}>{site.origin_server}</td>
                  <td><span className="badge badge-online">{site.status}</span></td>
                  <td>{Number(site.requests || 0).toLocaleString()}</td>
                  <td>{site.cacheRatio ?? 0}%</td>
                                      <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => checkHealth(site.id)}
                        disabled={checkingHealth[site.id]}
                        title="Real origin health check"
                      >
                        <Activity size={13} /> {checkingHealth[site.id] ? '...' : 'Health'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/dashboard/websites/${site.id}/dns`)}><Network size={13} /> DNS</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/dashboard/websites/${site.id}/security`)}><ShieldAlert size={13} /> Security</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditForm(site)}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(site.id)}><Trash2 size={13} /></button>
                    </div>
                    {healthResults[site.id] && (
                      <div style={{ marginTop: 6, fontSize: 12 }}>
                        {healthResults[site.id].isUp ? (
                          <span style={{ color: 'var(--success)' }}>
                            ● Real origin is UP ({healthResults[site.id].responseTimeMs}ms, HTTP {healthResults[site.id].statusCode})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--danger)' }}>
                            ● Real origin is DOWN {healthResults[site.id].error ? `(${healthResults[site.id].error})` : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(5,7,13,0.7)',
            backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 200, padding: 20,
          }}
          onClick={() => setShowForm(false)}
        >
          <div className="card fade-up" style={{ width: '100%', maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17 }}>{editingId ? 'Edit Website' : 'Add Website'}</h3>
              <button className="btn btn-ghost btn-sm" style={{ padding: 7 }} onClick={() => setShowForm(false)}><X size={15} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label>Domain Name</label>
                <input
                  type="text" placeholder="example.com" required
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label>Origin Server URL / IP</label>
                <input
                  type="text" placeholder="203.0.113.10" required
                  value={form.origin_server}
                  onChange={(e) => setForm({ ...form, origin_server: e.target.value })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div>
                  <label>Protocol</label>
                  <select value={form.protocol} onChange={(e) => setForm({ ...form, protocol: e.target.value })}>
                    <option value="HTTPS">HTTPS</option>
                    <option value="HTTP">HTTP</option>
                  </select>
                </div>
                <div>
                  <label>Cache TTL (sec)</label>
                  <input
                    type="number" min="0" required
                    value={form.cache_ttl}
                    onChange={(e) => setForm({ ...form, cache_ttl: Number(e.target.value) })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Website'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
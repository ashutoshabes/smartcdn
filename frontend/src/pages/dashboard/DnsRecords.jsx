import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Pencil, X, Cloud, CloudOff, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';

const RECORD_TYPES = ['A', 'CNAME', 'TXT', 'MX'];
const emptyForm = { type: 'A', name: '', value: '', ttl: 3600, proxied: true };

export default function DnsRecords() {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [website, setWebsite] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sitesRes, recordsRes] = await Promise.all([
        api.getWebsites(),
        api.getDnsRecords(websiteId),
      ]);
      if (sitesRes.success) {
        const site = sitesRes.websites.find((w) => String(w.id) === String(websiteId));
        setWebsite(site);
      }
      if (recordsRes.success) setRecords(recordsRes.records);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [websiteId]);

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingId(record.id);
    setForm({
      type: record.type,
      name: record.name,
      value: record.value,
      ttl: record.ttl,
      proxied: !!record.proxied,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.updateDnsRecord(editingId, form);
      } else {
        await api.addDnsRecord(websiteId, form);
      }
      setShowForm(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save DNS record');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this DNS record?')) return;
    await api.deleteDnsRecord(id);
    await loadData();
  };

  const toggleProxied = async (record) => {
    await api.updateDnsRecord(record.id, { ...record, proxied: !record.proxied });
    await loadData();
  };

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/dashboard/websites')}>
        <ArrowLeft size={14} /> Back to Websites
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 19 }}>{website ? website.domain : 'Loading...'}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>DNS Records</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openAddForm}>
          <Plus size={15} /> Add Record
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 10 }} />)}
          </div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <h4>No DNS records yet</h4>
            <p>Add an A, CNAME, TXT, or MX record for this domain.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Value</th>
                <th>Proxy status</th>
                <th>TTL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td><span className="badge" style={{ background: 'var(--surface)', color: 'var(--text-1)' }}>{r.type}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--text-0)' }}>{r.name}</td>
                  <td className="mono" style={{ fontSize: 12.5 }}>{r.value}</td>
                  <td>
                    <button
                      className="tooltip"
  data-tip={r.proxied ? 'Proxied through CDNexus' : 'DNS only (direct to origin)'}
                      onClick={() => toggleProxied(r)}
                      style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                        color: r.proxied ? '#f5a524' : 'var(--text-3)', fontSize: 12.5, fontWeight: 600,
                      }}
                    >
                      {r.proxied ? <Cloud size={16} fill="#f5a524" /> : <CloudOff size={16} />}
                      {r.proxied ? 'Proxied' : 'DNS only'}
                    </button>
                  </td>
                  <td>{r.proxied ? 'Auto' : `${r.ttl}s`}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEditForm(r)}><Pencil size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
              <h3 style={{ fontSize: 17 }}>{editingId ? 'Edit DNS Record' : 'Add DNS Record'}</h3>
              <button className="btn btn-ghost btn-sm" style={{ padding: 7 }} onClick={() => setShowForm(false)}><X size={15} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label>Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {RECORD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label>Name</label>
                  <input
                    type="text" placeholder="@ or www" required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label>Value</label>
                <input
                  type="text"
                  placeholder={form.type === 'A' ? '192.0.2.10' : form.type === 'MX' ? 'mail.example.com' : 'target.example.com'}
                  required
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, alignItems: 'end' }}>
                <div>
                  <label>TTL (seconds)</label>
                  <input
                    type="number" min="0" disabled={form.proxied}
                    value={form.ttl}
                    onChange={(e) => setForm({ ...form, ttl: Number(e.target.value) })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, proxied: !form.proxied })}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'flex-start', gap: 8, color: form.proxied ? '#f5a524' : 'var(--text-2)' }}
                >
                  {form.proxied ? <Cloud size={16} fill="#f5a524" /> : <CloudOff size={16} />}
                  {form.proxied ? 'Proxied' : 'DNS only'}
                </button>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Record'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
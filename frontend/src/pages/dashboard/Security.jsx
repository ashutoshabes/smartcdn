import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ShieldAlert, ArrowLeft, ShieldCheck, ShieldOff, X } from 'lucide-react';
import { api } from '../../services/api';
import { testRealWaf } from '../../utils/realWaf';
import { ShieldCheck as ShieldCheckIcon } from 'lucide-react';
const LOCATIONS = ['India', 'Singapore', 'Japan', 'UK', 'Germany', 'USA East', 'USA West'];
const emptyForm = { rule_type: 'country_block', value: 'Germany', action: 'block' };

export default function Security() {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const [website, setWebsite] = useState(null);
  const [rules, setRules] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [wafTestCountry, setWafTestCountry] = useState('IN');
  const [wafTestResult, setWafTestResult] = useState(null);
  const [wafTesting, setWafTesting] = useState(false);
   const [headersAudit, setHeadersAudit] = useState(null);
  const [auditingHeaders, setAuditingHeaders] = useState(false);
  const loadData = async () => {
    setLoading(true);
    try {
      const [sitesRes, rulesRes, eventsRes] = await Promise.all([
        api.getWebsites(),
        api.getSecurityRules(websiteId),
        api.getSecurityEvents(websiteId),
      ]);
      if (sitesRes.success) setWebsite(sitesRes.websites.find((w) => String(w.id) === String(websiteId)));
      if (rulesRes.success) setRules(rulesRes.rules);
      if (eventsRes.success) setEvents(eventsRes.events);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [websiteId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.addSecurityRule(websiteId, form);
      setShowForm(false);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add rule');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (rule) => {
    await api.toggleSecurityRule(rule.id);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this security rule?')) return;
    await api.deleteSecurityRule(id);
    await loadData();
  };

  const runRealWafTest = async () => {
    setWafTesting(true);
    setWafTestResult(null);
    const testResult = await testRealWaf(wafTestCountry);
    setWafTestResult(testResult);
    setWafTesting(false);
  };
   const runHeadersAudit = async () => {
    setAuditingHeaders(true);
    try {
      const res = await api.getSecurityHeadersAudit(websiteId);
      setHeadersAudit(res);
    } catch (err) {
      setHeadersAudit({ success: false, error: 'Audit failed' });
    } finally {
      setAuditingHeaders(false);
    }
  };
  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate('/dashboard/websites')}>
        <ArrowLeft size={14} /> Back to Websites
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 19 }}>{website ? website.domain : 'Loading...'}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>Security Rules (WAF)</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Add Rule
        </button>
      </div>

      {/* Rules table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
        {loading ? (
          <div style={{ padding: 20 }}><div className="skeleton" style={{ height: 44 }} /></div>
        ) : rules.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert size={28} color="var(--text-3)" style={{ marginBottom: 10 }} />
            <h4>No security rules yet</h4>
            <p>Block traffic from specific locations to simulate WAF-style protection.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Value</th>
                <th>Action</th>
                <th>Status</th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <td>{r.rule_type === 'country_block' ? 'Country Block' : r.rule_type}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-0)' }}>{r.value}</td>
                  <td style={{ textTransform: 'capitalize' }}>{r.action}</td>
                  <td>
                    <button
                      onClick={() => handleToggle(r)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                    >
                      {r.enabled ? (
                        <span className="badge badge-online"><ShieldCheck size={12} /> Active</span>
                      ) : (
                        <span className="badge" style={{ background: 'var(--surface)', color: 'var(--text-3)' }}><ShieldOff size={12} /> Disabled</span>
                      )}
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Real WAF test against live Cloudflare Worker */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 6 }}>Live WAF Test (Real Endpoint)</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14 }}>
          This tests genuine blocking against a real, publicly deployed Cloudflare Worker —
          using Cloudflare's real country-detection data, not simulated.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 160px' }}>
            <label>Block country code</label>
            <input
              type="text"
              value={wafTestCountry}
              onChange={(e) => setWafTestCountry(e.target.value.toUpperCase())}
              placeholder="e.g. IN"
              maxLength={2}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={runRealWafTest} disabled={wafTesting}>
            {wafTesting ? 'Testing...' : 'Run Real Test'}
          </button>
        </div>
        
        {wafTestResult && wafTestResult.success && (
          <div className="fade-up" style={{ marginTop: 16, fontSize: 13.5 }}>
            <div>HTTP Status: <strong>{wafTestResult.httpStatus}</strong></div>
            {wafTestResult.blocked ? (
              <div style={{ color: 'var(--danger)', marginTop: 6 }}>
                🚫 Genuinely blocked — your real request from <strong>{wafTestResult.data.realCountry}</strong> matched the rule.
              </div>
            ) : (
              <div style={{ color: 'var(--success)', marginTop: 6 }}>
                ✅ Request allowed — your real country did not match "{wafTestCountry}".
              </div>
            )}
          </div>
        )}
        {wafTestResult && !wafTestResult.success && (
          <div style={{ marginTop: 16, color: 'var(--danger)', fontSize: 13.5 }}>
            Test failed: {wafTestResult.error}
          </div>
        )}
      </div>
      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, marginBottom: 6 }}>Security Headers Audit (Real)</h3>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 14 }}>
          Inspects real HTTP response headers from your website's actual origin.
        </p>
        <button className="btn btn-outline btn-sm" onClick={runHeadersAudit} disabled={auditingHeaders}>
          {auditingHeaders ? 'Auditing...' : 'Run Real Audit'}
        </button>

        {headersAudit && headersAudit.success && (
          <div className="fade-up" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              {headersAudit.score} <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 400 }}>/ 100</span>
            </div>
            {headersAudit.serverHeader && (
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 12 }}>
                Server: <span className="mono">{headersAudit.serverHeader}</span>
              </div>
            )}
            <div style={{ display: 'grid', gap: 6 }}>
              {headersAudit.results.map((r) => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{r.label}</span>
                  <span style={{ color: r.present ? 'var(--success)' : 'var(--text-3)' }}>
                    {r.present ? '✓ Present' : '✗ Missing'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {headersAudit && !headersAudit.success && (
          <div style={{ marginTop: 16, color: 'var(--danger)', fontSize: 13.5 }}>
            {headersAudit.error}
          </div>
        )}
      </div>
      {/* Firewall events log */}
      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Recent Firewall Events</h3>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No blocked requests yet. Try simulating a request from a blocked location.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Action Taken</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.user_location}</td>
                  <td>
                    <span className="badge" style={{ background: 'rgba(239,68,68,0.18)', color: '#fca5a5' }}>
                      {e.action_taken?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5 }}>{new Date(e.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(5,7,13,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
          onClick={() => setShowForm(false)}
        >
          <div className="card fade-up" style={{ width: '100%', maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17 }}>Add Security Rule</h3>
              <button className="btn btn-ghost btn-sm" style={{ padding: 7 }} onClick={() => setShowForm(false)}><X size={15} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label>Block traffic from</label>
                <select value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })}>
                  {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label>Action</label>
                <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}>
                  <option value="block">Block</option>
                  <option value="challenge">Challenge</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : 'Add Rule'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
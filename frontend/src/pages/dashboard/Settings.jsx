import { useState, useEffect } from 'react';
import { User, Lock, SlidersHorizontal, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState(null); // { type: 'success'|'error', text }

  const [cdnSettings, setCdnSettings] = useState(null);
  const [cdnSaving, setCdnSaving] = useState(false);
  const [cdnMessage, setCdnMessage] = useState(null);

  useEffect(() => {
    api.getSettings().then((res) => {
      if (res.success) setCdnSettings(res.settings);
    });
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMessage(null);
    if (pwForm.newPassword !== pwForm.confirmNew) {
      setPwMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPwSaving(true);
    try {
      const res = await api.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (res.success) {
        setPwMessage({ type: 'success', text: 'Password updated successfully' });
        setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
      } else {
        setPwMessage({ type: 'error', text: res.message });
      }
    } catch (err) {
      setPwMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update password' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleCdnSave = async () => {
    setCdnSaving(true);
    setCdnMessage(null);
    try {
      await api.updateSettings(cdnSettings);
      setCdnMessage({ type: 'success', text: 'CDN settings saved' });
    } catch (err) {
      setCdnMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setCdnSaving(false);
    }
  };

  if (!cdnSettings) {
    return (
      <div style={{ display: 'grid', gap: 18 }}>
        <div className="skeleton" style={{ height: 200 }} />
        <div className="skeleton" style={{ height: 260 }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 20, maxWidth: 640 }}>
      {/* Profile */}
      <div className="card">
        <SectionTitle icon={User} title="Profile" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 16 }}>
          <div>
            <label>Name</label>
            <input type="text" value={user?.name || ''} disabled />
          </div>
          <div>
            <label>Email</label>
            <input type="text" value={user?.email || ''} disabled />
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="card">
        <SectionTitle icon={Lock} title="Change Password" />
        {pwMessage && <Message {...pwMessage} />}
        <form onSubmit={handlePasswordSubmit} style={{ marginTop: 16, display: 'grid', gap: 14 }}>
          <div>
            <label>Current Password</label>
            <input
              type="password" required
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label>New Password</label>
              <input
                type="password" required
                value={pwForm.newPassword}
                onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              />
            </div>
            <div>
              <label>Confirm New Password</label>
              <input
                type="password" required
                value={pwForm.confirmNew}
                onChange={(e) => setPwForm({ ...pwForm, confirmNew: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }} disabled={pwSaving}>
            {pwSaving ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* CDN Settings */}
      <div className="card">
        <SectionTitle icon={SlidersHorizontal} title="CDN Settings" />
        {cdnMessage && <Message {...cdnMessage} />}

        <div style={{ marginTop: 16, display: 'grid', gap: 16 }}>
          <div>
            <label>Default Cache TTL (seconds)</label>
            <input
              type="number" min="0"
              value={cdnSettings.default_cache_ttl}
              onChange={(e) => setCdnSettings({ ...cdnSettings, default_cache_ttl: Number(e.target.value) })}
            />
          </div>

          <div>
            <label>Routing Mode</label>
            <select
              value={cdnSettings.routing_mode}
              onChange={(e) => setCdnSettings({ ...cdnSettings, routing_mode: e.target.value })}
            >
              <option value="smart">Smart Routing (location + latency + load)</option>
              <option value="lowest_latency">Lowest Latency</option>
              <option value="lowest_load">Lowest Server Load</option>
            </select>
          </div>

          <ToggleRow
            label="Enable Cache"
            checked={!!cdnSettings.cache_enabled}
            onChange={(v) => setCdnSettings({ ...cdnSettings, cache_enabled: v })}
          />
          <ToggleRow
            label="Enable Failover"
            checked={!!cdnSettings.failover_enabled}
            onChange={(v) => setCdnSettings({ ...cdnSettings, failover_enabled: v })}
          />
          <ToggleRow
            label="Enable Analytics"
            checked={!!cdnSettings.analytics_enabled}
            onChange={(v) => setCdnSettings({ ...cdnSettings, analytics_enabled: v })}
          />

          <button className="btn btn-primary" style={{ justifySelf: 'start' }} onClick={handleCdnSave} disabled={cdnSaving}>
            {cdnSaving ? 'Saving...' : 'Save CDN Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon size={17} color="var(--primary)" />
      <h3 style={{ fontSize: 15.5 }}>{title}</h3>
    </div>
  );
}

function Message({ type, text }) {
  return (
    <div style={{
      marginTop: 14, padding: '9px 14px', borderRadius: 8, fontSize: 13,
      background: type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
      color: type === 'success' ? '#4ade80' : '#f87171',
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {type === 'success' && <Check size={13} />} {text}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 14 }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer',
          background: checked ? 'var(--primary)' : 'var(--surface)',
          position: 'relative', transition: 'background var(--fast) var(--ease)',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          transition: 'left var(--fast) var(--ease)',
        }} />
      </button>
    </div>
  );
}
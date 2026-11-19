import { useState, useEffect } from 'react';
import { Server, Cpu, MemoryStick, Activity, Gauge } from 'lucide-react';
import { api } from '../../services/api';
import WorldMap from '../../components/WorldMap';
const STATUS_OPTIONS = ['online', 'offline', 'maintenance'];

export default function EdgeNetwork() {
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const loadServers = async () => {
    try {
      const res = await api.getEdgeServers();
      if (res.success) setServers(res.edgeServers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServers();
    const interval = setInterval(loadServers, 4000);
    return () => clearInterval(interval);
  }, []);

  const cycleStatus = async (server) => {
    const currentIndex = STATUS_OPTIONS.indexOf(server.status);
    const nextStatus = STATUS_OPTIONS[(currentIndex + 1) % STATUS_OPTIONS.length];

    setUpdatingId(server.id);
    try {
      await api.updateEdgeStatus(server.id, nextStatus);
      setServers((prev) =>
        prev.map((s) => (s.id === server.id ? { ...s, status: nextStatus } : s))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <div key={i} className="skeleton" style={{ height: 190 }} />)}
      </div>
    );
  }

return (
    <div>
      <WorldMap servers={servers} />
      <p style={{ color: 'var(--text-2)', fontSize: 13.5, marginBottom: 20 }}>
        Click a server's status badge to cycle it between Online → Offline → Maintenance.
        Taking a server offline will remove it from routing consideration in the simulator.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
        {servers.map((server) => (
          <div className="card fade-up" key={server.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: 'var(--primary-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Server size={18} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{server.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{server.location}, {server.region}</div>
                </div>
              </div>

              <button
                onClick={() => cycleStatus(server)}
                disabled={updatingId === server.id}
                className={`badge badge-${server.status}`}
                style={{ border: 'none', cursor: 'pointer' }}
                title="Click to change status"
              >
                <span className={`dot dot-${server.status} ${server.status === 'online' ? 'pulse' : ''}`} />
                {server.status}
              </button>
            </div>

            <div className="mono" style={{ fontSize: 11.5, color: 'var(--text-3)', marginBottom: 16 }}>
              {server.ip_address}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12.5 }}>
              <StatRow icon={Cpu} label="CPU" value={`${server.cpu_usage}%`} />
              <StatRow icon={MemoryStick} label="Memory" value={`${server.memory_usage}%`} />
              <StatRow icon={Activity} label="Requests" value={server.current_requests} />
              <StatRow icon={Gauge} label="Latency" value={`${server.latency} ms`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-1)' }}>
      <Icon size={13} color="var(--text-3)" />
      <span style={{ color: 'var(--text-2)' }}>{label}:</span> {value}
    </div>
  );
}
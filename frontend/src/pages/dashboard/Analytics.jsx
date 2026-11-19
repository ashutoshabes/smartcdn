import { useState, useEffect } from 'react';
import { Activity, Percent, Gauge, Zap, TrendingDown, Server } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [traffic, setTraffic] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
    const [realSystem, setRealSystem] = useState(null);
  useEffect(() => {
    async function loadAll() {
      try {
                const [overviewRes, trafficRes, logsRes, realSystemRes] = await Promise.all([
          api.getOverview(),
          api.getTraffic(),
          api.getLogs(1, 100), // pull a larger recent batch for trend analysis
          api.getRealSystem(),
        ]);
              if (overviewRes.success) setOverview(overviewRes);
        if (trafficRes.success) setTraffic(trafficRes.traffic);
        if (logsRes.success) setLogs(logsRes.logs);
        if (realSystemRes.success) setRealSystem(realSystemRes);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton" style={{ height: 110 }} />)}
      </div>
    );
  }

  // Derive extra insights from the logs we already have
  const requestsToday = logs.filter((l) => {
    const d = new Date(l.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const originRequestsSaved = logs.filter((l) => l.cache_result === 'HIT').length;

  const fastestServer = traffic.length > 0
    ? [...traffic].sort((a, b) => a.requests - b.requests)[0]?.location
    : '—';

  const mostUsedServer = traffic.length > 0
    ? [...traffic].sort((a, b) => b.requests - a.requests)[0]?.location
    : '—';

  // Build a simple response-time trend from the most recent logs, oldest -> newest
  const trendData = [...logs]
    .reverse()
    .slice(-20)
    .map((l, i) => ({ index: i + 1, responseTime: l.response_time }));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
                <StatCard icon={Activity} label="Total Requests" value={overview.totalRequests.toLocaleString()} tint="blue" />
        <StatCard icon={Zap} label="Requests Today" value={requestsToday} tint="orange" />
        <StatCard icon={Percent} label="Cache Hit Ratio" value={`${overview.cacheHitRatio}%`} tint="green" />
        <StatCard icon={TrendingDown} label="Origin Requests Saved" value={originRequestsSaved} tint="purple" />
        <StatCard icon={Gauge} label="Avg Latency" value={`${overview.avgResponseTime} ms`} tint="orange" />
        <StatCard icon={Server} label="Active Edge Servers" value={overview.activeEdgeServers} tint="blue" />
      </div>

      {realSystem && (
        <div className="card" style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            Real Backend System Stats (this machine, live)
          </div>
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', fontSize: 13.5 }}>
            <div><span style={{ color: 'var(--text-2)' }}>Platform:</span> <strong>{realSystem.platform}</strong></div>
            <div><span style={{ color: 'var(--text-2)' }}>CPU Cores:</span> <strong>{realSystem.cpuCores}</strong></div>
            <div><span style={{ color: 'var(--text-2)' }}>Memory Used:</span> <strong>{realSystem.usedMemoryPercent}%</strong> ({realSystem.freeMemoryGB}GB free of {realSystem.totalMemoryGB}GB)</div>
            <div><span style={{ color: 'var(--text-2)' }}>Server Uptime:</span> <strong>{realSystem.processUptimeSeconds}s</strong></div>
            <div><span style={{ color: 'var(--text-2)' }}>Node Version:</span> <strong>{realSystem.nodeVersion}</strong></div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 18 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 18 }}>Response Time Trend (Recent Requests)</h3>
          {trendData.length === 0 ? (
            <div className="empty-state"><p>No data yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis dataKey="index" stroke="var(--text-3)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--text-3)" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13 }} />
                <Line type="monotone" dataKey="responseTime" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 18 }}>Traffic by Region</h3>
          {traffic.length === 0 ? (
            <div className="empty-state"><p>No data yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={traffic} layout="vertical">
                <XAxis type="number" stroke="var(--text-3)" fontSize={12} />
                <YAxis dataKey="location" type="category" stroke="var(--text-3)" fontSize={12} width={90} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="requests" fill="var(--cyan)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Activity, Percent, Server, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../../services/api';
import StatCard from '../../components/StatCard';

const PIE_COLORS = ['#22c55e', '#f5a524'];

export default function Overview() {
  const [overview, setOverview] = useState(null);
  const [traffic, setTraffic] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [overviewRes, trafficRes, performanceRes] = await Promise.all([
          api.getOverview(),
          api.getTraffic(),
          api.getPerformance(),
        ]);
        if (overviewRes.success) setOverview(overviewRes);
        if (trafficRes.success) setTraffic(trafficRes.traffic);
        if (performanceRes.success) {
          setPerformance(
            performanceRes.performance.map((p) => ({ name: p.cache_result, value: p.count }))
          );
        }
      } catch (err) {
        setError('Could not load analytics. Is the backend running?');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
      </div>
    );
  }

  if (error) {
    return <div className="empty-state card"><h4>Something went wrong</h4><p>{error}</p></div>;
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, marginBottom: 24 }}>
                <StatCard icon={Activity} label="Total Requests" value={overview.totalRequests.toLocaleString()} tint="blue" />
        <StatCard icon={Percent} label="Cache Hit Ratio" value={`${overview.cacheHitRatio}%`} tint="orange" />
        <StatCard icon={Server} label="Active Edge Servers" value={overview.activeEdgeServers} tint="green" />
        <StatCard icon={Gauge} label="Avg Response Time" value={`${overview.avgResponseTime} ms`} tint="purple" /></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: 18 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 18 }}>Traffic by Edge Location</h3>
          {traffic.length === 0 ? (
            <div className="empty-state"><p>No requests yet — try the Request Simulator.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={traffic}>
                <XAxis dataKey="location" stroke="var(--text-3)" fontSize={12} />
                <YAxis stroke="var(--text-3)" fontSize={12} />
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13 }} />
                <Bar dataKey="requests" fill="var(--primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 18 }}>Cache HIT vs MISS</h3>
          {performance.length === 0 ? (
            <div className="empty-state"><p>No cache data yet.</p></div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={performance} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {performance.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-2)', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12.5 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
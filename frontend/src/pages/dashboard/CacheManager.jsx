import { useState, useEffect, useMemo } from 'react';
import { Database, Trash2, RotateCw, Filter } from 'lucide-react';
import { api } from '../../services/api';

export default function CacheManager() {
  const [cache, setCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterServer, setFilterServer] = useState('all');
  const [clearing, setClearing] = useState(false);

  const loadCache = async () => {
    setLoading(true);
    try {
      const res = await api.getCache();
      if (res.success) setCache(res.cache);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCache(); }, []);

  const edgeServerNames = useMemo(
    () => [...new Set(cache.map((c) => c.edge_server_name))],
    [cache]
  );

  const filtered = filterServer === 'all' ? cache : cache.filter((c) => c.edge_server_name === filterServer);

  const stats = useMemo(() => {
    const totalSize = cache.reduce((sum, c) => sum + (c.size || 0), 0);
    return {
      totalItems: cache.length,
      totalSizeKB: totalSize,
      servers: edgeServerNames.length,
    };
  }, [cache, edgeServerNames]);

  const handleDelete = async (id) => {
    await api.deleteCacheEntry(id);
    setCache((prev) => prev.filter((c) => c.id !== id));
  };

  const handleClearAll = async () => {
    if (!confirm('Clear ALL cached content across every edge server? This cannot be undone.')) return;
    setClearing(true);
    try {
      await api.clearCache();
      setCache([]);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
        <MiniStat label="Total Cached Items" value={stats.totalItems} />
        <MiniStat label="Total Cache Size" value={`${(stats.totalSizeKB / 1024).toFixed(2)} MB`} />
        <MiniStat label="Edge Servers Used" value={stats.servers} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color="var(--text-2)" />
          <select value={filterServer} onChange={(e) => setFilterServer(e.target.value)} style={{ width: 200 }}>
            <option value="all">All Edge Servers</option>
            {edgeServerNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={loadCache}><RotateCw size={13} /> Refresh</button>
          <button className="btn btn-danger btn-sm" onClick={handleClearAll} disabled={clearing || cache.length === 0}>
            <Trash2 size={13} /> Clear All Cache
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 10 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Database size={30} color="var(--text-3)" style={{ marginBottom: 10 }} />
            <h4>No cached content</h4>
            <p>Run some requests in the Request Simulator to populate the cache.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Content</th>
                <th>Edge Server</th>
                <th>Status</th>
                <th>TTL</th>
                <th>Size</th>
                <th>Last Accessed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td className="mono" style={{ fontSize: 12.5, color: 'var(--text-0)' }}>{entry.content_path}</td>
                  <td>{entry.edge_server_name}</td>
                  <td><span className="badge badge-hit">HIT</span></td>
                  <td>{entry.ttl}s</td>
                  <td>{entry.size} KB</td>
                  <td style={{ fontSize: 12.5 }}>{new Date(entry.last_accessed).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry.id)}><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{label}</div>
    </div>
  );
}
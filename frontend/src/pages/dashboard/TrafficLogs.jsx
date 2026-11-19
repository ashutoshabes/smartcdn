
import { useState, useEffect } from 'react';
import { ScrollText, ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';
import { api } from '../../services/api';

export default function TrafficLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadLogs = async (pageNum) => {
    setLoading(true);
    try {
      const res = await api.getLogs(pageNum, 15);
      if (res.success) {
        setLogs(res.logs);
        setTotalPages(res.totalPages || 1);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(page); }, [page]);

  const filtered = logs.filter((log) => {
    const matchesSearch =
      !search ||
      log.domain?.toLowerCase().includes(search.toLowerCase()) ||
      log.content_path?.toLowerCase().includes(search.toLowerCase()) ||
      log.user_location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.cache_result === statusFilter;
    return matchesSearch && matchesStatus;
  });
const exportCSV = () => {
    const headers = ['Request ID', 'Website', 'User Location', 'Edge Server', 'Content', 'Cache Result', 'Response Time (ms)', 'Status', 'Timestamp'];
    const rows = filtered.map((l) => [
      l.request_id, l.domain || '', l.user_location, l.edge_server_name || '',
      l.content_path, l.cache_result, l.response_time, l.status, l.created_at,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartcdn-logs-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="text" placeholder="Search domain, content, or location..."
            style={{ paddingLeft: 34 }}
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
       <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: 160 }}>
          <option value="all">All Results</option>
          <option value="HIT">HIT only</option>
          <option value="MISS">MISS only</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV} disabled={filtered.length === 0}>
          <Download size={13} /> Export CSV
        </button>
      </div>
      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 20 }}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 40, marginBottom: 10 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ScrollText size={30} color="var(--text-3)" style={{ marginBottom: 10 }} />
            <h4>No logs found</h4>
            <p>Try adjusting your filters, or run some requests in the Simulator.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Website</th>
                <th>User Location</th>
                <th>Edge Server</th>
                <th>Content</th>
                <th>Result</th>
                <th>Response Time</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td className="mono" style={{ fontSize: 12 }}>{log.request_id}</td>
                  <td>{log.domain || '—'}</td>
                  <td>{log.user_location}</td>
                  <td>{log.edge_server_name || '—'}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{log.content_path}</td>
                  <td>
                    {log.cache_result === 'HIT' && <span className="badge badge-hit">HIT</span>}
                    {log.cache_result === 'MISS' && <span className="badge badge-miss">MISS</span>}
                    {log.cache_result === 'N/A' && <span className="badge badge-error">N/A</span>}
                  </td>
                  <td>{log.response_time} ms</td>
                                   <td>
                    {log.status === 'success' && <span className="badge badge-success">SUCCESS</span>}
                    {log.status === 'error' && <span className="badge badge-error">ERROR</span>}
                    {log.status === 'blocked' && <span className="badge" style={{ background: 'rgba(239,68,68,0.18)', color: '#fca5a5' }}>BLOCKED</span>}
                  </td>
                  <td style={{ fontSize: 12 }}>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 20 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
import { User, Server, Database, Cloud, Check, X } from 'lucide-react';

// stage: null | 'routing' | 'cache-check' | 'hit' | 'miss-origin' | 'done'
export default function SimulatorFlow({ stage, cacheResult }) {
  const isHit = cacheResult === 'HIT';

  const nodes = [
    { key: 'user', label: 'User', icon: User, active: !!stage },
    { key: 'edge', label: 'Edge Server', icon: Server, active: stage && stage !== 'idle' },
    { key: 'cache', label: 'Cache', icon: Database, active: ['cache-check', 'hit', 'miss-origin', 'done'].includes(stage) },
    { key: 'origin', label: 'Origin Server', icon: Cloud, active: ['miss-origin', 'done'].includes(stage) && !isHit },
  ];

  return (
    <div className="card" style={{ padding: '32px 20px' }}>
      <div className="sim-track">
        {nodes.map((node, i) => (
          <div className="sim-node-wrap" key={node.key}>
            <div className="sim-node">
              <div
                className={`sim-icon ${node.active ? 'sim-icon-active pulse' : ''}`}
                style={{
                  background: node.active ? 'var(--primary-soft)' : 'var(--surface)',
                  border: `1px solid ${node.active ? 'var(--primary)' : 'var(--border)'}`,
                }}
              >
                <node.icon size={22} color={node.active ? 'var(--primary)' : 'var(--text-3)'} />
              </div>
              <span className="sim-label" style={{ color: node.active ? 'var(--text-0)' : 'var(--text-3)' }}>
                {node.label}
              </span>
            </div>
            {i < nodes.length - 1 && <div className="sim-line" />}
          </div>
        ))}
      </div>

      {stage === 'done' && (
        <div className="fade-up" style={{ textAlign: 'center', marginTop: 24 }}>
          <span className={`badge ${isHit ? 'badge-hit' : 'badge-miss'}`} style={{ fontSize: 14, padding: '8px 18px' }}>
            {isHit ? <Check size={14} /> : <X size={14} />} CACHE {cacheResult}
          </span>
        </div>
      )}

      <style>{`
        .sim-track { display: flex; align-items: center; justify-content: space-between; }
        .sim-node-wrap { display: flex; align-items: center; flex: 1; }
        .sim-node { display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0; }
        .sim-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; transition: all var(--med) var(--ease); }
        .sim-label { font-size: 12.5px; font-weight: 600; white-space: nowrap; transition: color var(--med) var(--ease); }
        .sim-line { flex: 1; height: 2px; margin: 0 6px 26px; background-image: linear-gradient(90deg, var(--border) 50%, transparent 50%); background-size: 10px 2px; }
        @media (max-width: 640px) { .sim-label { font-size: 10px; } .sim-icon { width: 44px; height: 44px; } }
      `}</style>
    </div>
  );
}
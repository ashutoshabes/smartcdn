import { User, Server, Database, Cloud } from 'lucide-react';

const NODES = [
  { label: 'User', icon: User, color: 'var(--text-1)' },
  { label: 'Edge Server', icon: Server, color: 'var(--primary)' },
  { label: 'Cache', icon: Database, color: 'var(--cyan)' },
  { label: 'Origin Server', icon: Cloud, color: 'var(--violet)' },
];

export default function FlowVisual() {
  return (
    <div className="flow-visual card" style={{ padding: '36px 24px' }}>
      <div className="flow-track">
        {NODES.map((node, i) => (
          <div className="flow-node-wrap" key={node.label}>
            <div className="flow-node">
              <div
                className="flow-icon pulse"
                style={{ background: `color-mix(in srgb, ${node.color} 18%, transparent)`, border: `1px solid ${node.color}` }}
              >
                <node.icon size={22} color={node.color} />
              </div>
              <span className="flow-label">{node.label}</span>
            </div>
            {i < NODES.length - 1 && (
              <div className="flow-line">
                <div className="flow-packet" style={{ animationDelay: `${i * 0.6}s` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .flow-track {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .flow-node-wrap { display: flex; align-items: center; flex: 1; }
        .flow-node { display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0; }
        .flow-icon {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
        }
        .flow-label { font-size: 12.5px; color: var(--text-2); font-weight: 600; white-space: nowrap; }
        .flow-line {
          flex: 1; height: 2px; background: var(--border);
          margin: 0 6px 26px; position: relative; overflow: visible;
          background-image: linear-gradient(90deg, var(--border) 50%, transparent 50%);
          background-size: 10px 2px;
        }
        .flow-packet {
          position: absolute; top: 50%; left: 0;
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--cyan);
          box-shadow: 0 0 10px var(--cyan), 0 0 20px var(--cyan);
          transform: translateY(-50%);
          animation: travelLine 2.4s linear infinite;
        }
        @keyframes travelLine {
          0% { left: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @media (max-width: 640px) {
          .flow-label { font-size: 10.5px; }
          .flow-icon { width: 44px; height: 44px; }
        }
      `}</style>
    </div>
  );
}
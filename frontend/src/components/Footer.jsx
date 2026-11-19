import { Network, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 100, padding: '50px 0 30px' }}>
      <div className="container" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 40 }}>
        <div style={{ maxWidth: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Network size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>CDNexus</span>
          </div>
          <p style={{ color: 'var(--text-2)', fontSize: 13.5, lineHeight: 1.6 }}>
            A simulated cloud content delivery network — built to demonstrate intelligent
            routing, edge caching, and failover concepts.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <a href="#features" style={{ color: 'var(--text-1)' }}>Features</a>
            <a href="#how-it-works" style={{ color: 'var(--text-1)' }}>How It Works</a>
            <a href="#network" style={{ color: 'var(--text-1)' }}>Edge Network</a>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
            <a href="#" style={{ color: 'var(--text-1)' }}>Documentation</a>
            <a href="#" style={{ color: 'var(--text-1)' }}>About</a>
            <a href="#" style={{ color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 6 }}>
  <ExternalLink size={14} /> GitHub
</a>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--border)', fontSize: 13, color: 'var(--text-3)' }}>
       © 2026 CDNexus. A college simulation project — not affiliated with any commercial CDN provider.
      </div>
    </footer>
  );
}
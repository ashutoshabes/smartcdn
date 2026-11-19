import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Network, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div
        className="glass"
        style={{
          margin: '16px auto 0',
          maxWidth: 1240,
          borderRadius: 16,
          padding: '12px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Network size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
              CDNexus
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#network">Edge Network</a>
          </nav>

          {/* Auth buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }} className="nav-auth">
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="btn btn-ghost btn-sm mobile-toggle"
            style={{ display: 'none' }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="fade-up" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <a href="#features" onClick={() => setOpen(false)}>Features</a>
            <a href="#how-it-works" onClick={() => setOpen(false)}>How It Works</a>
            <a href="#network" onClick={() => setOpen(false)}>Edge Network</a>
            <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>Get Started</Link>
          </div>
        )}
      </div>

      <style>{`
        .nav-links a { color: var(--text-1); font-size: 14px; font-weight: 500; transition: color var(--fast) var(--ease); }
        .nav-links a:hover { color: var(--text-0); }
        @media (max-width: 760px) {
          .nav-links, .nav-auth { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
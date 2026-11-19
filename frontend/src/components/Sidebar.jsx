import { NavLink, useNavigate } from 'react-router-dom';
import {
  Network, LayoutDashboard, Globe, Server, Send, Database,
  ScrollText, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/websites', label: 'Websites', icon: Globe },
  { to: '/dashboard/edge-network', label: 'Edge Network', icon: Server },
  { to: '/dashboard/simulator', label: 'Request Simulator', icon: Send },
  { to: '/dashboard/cache', label: 'Cache Manager', icon: Database },
  { to: '/dashboard/logs', label: 'Traffic Logs', icon: ScrollText },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className="glass"
      style={{
        width: collapsed ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)',
        position: 'fixed', top: 16, left: 16, bottom: 16,
        borderRadius: 16, display: 'flex', flexDirection: 'column',
        padding: '18px 12px', transition: 'width var(--med) var(--ease)',
        zIndex: 50, overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px 22px', overflow: 'hidden' }}>
        <div style={{
          width: 32, height: 32, minWidth: 32, borderRadius: 9,
          background: 'linear-gradient(135deg, var(--primary), var(--cyan))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Network size={17} color="white" />
        </div>
        {!collapsed && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap' }}>CDNexus</span>}
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} style={{ minWidth: 18 }} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: collapse toggle + logout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        <button className="sidebar-link" onClick={() => setCollapsed(!collapsed)} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button className="sidebar-link" onClick={handleLogout} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', color: '#f87171' }}>
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <style>{`
        .sidebar-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          color: var(--text-2); font-size: 13.5px; font-weight: 500;
          transition: all var(--fast) var(--ease); cursor: pointer; white-space: nowrap;
        }
        .sidebar-link:hover { background: var(--surface-hover); color: var(--text-0); }
        .sidebar-link.active { background: var(--primary-soft); color: #8ab4ff; }
      `}</style>
    </aside>
  );
}
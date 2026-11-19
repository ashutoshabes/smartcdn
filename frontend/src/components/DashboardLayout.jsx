import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const TITLES = {
  '/dashboard': 'Overview',
  '/dashboard/websites': 'Websites',
  '/dashboard/edge-network': 'Edge Network',
  '/dashboard/simulator': 'Request Simulator',
  '/dashboard/cache': 'Cache Manager',
  '/dashboard/logs': 'Traffic Logs',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/settings': 'Settings',
};

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = TITLES[location.pathname] || 'Dashboard';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        style={{
          marginLeft: collapsed ? 'calc(var(--sidebar-w-collapsed) + 32px)' : 'calc(var(--sidebar-w) + 32px)',
          padding: '20px 28px 40px',
          transition: 'margin-left var(--med) var(--ease)',
        }}
      >
        <DashboardHeader title={title} />
        <Outlet />
      </main>
    </div>
  );
}
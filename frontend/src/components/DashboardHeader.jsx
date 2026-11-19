import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function DashboardHeader({ title }) {
  const { user } = useAuth();
   const [dark, setDark] = useState(() => localStorage.getItem('smartcdn_theme') === 'dark');

  useEffect(() => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('smartcdn_theme', dark ? 'dark' : 'light');
  }, [dark]);
  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 14 }}>
      <h1 style={{ fontSize: 24 }}>{title}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input type="text" placeholder="Search..." style={{ paddingLeft: 34, width: 200 }} />
        </div>
        <button className="btn btn-ghost btn-sm tooltip" data-tip="Notifications" style={{ padding: 9 }}>
          <Bell size={16} />
        </button>
        <button className="btn btn-ghost btn-sm tooltip" data-tip="Toggle theme" style={{ padding: 9 }} onClick={() => setDark(!dark)}>
          {dark ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div className="tooltip" data-tip={user?.email} style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--primary), var(--violet))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'white', cursor: 'pointer',
        }}>
          {initials}
        </div>
      </div>
    </header>
  );
}
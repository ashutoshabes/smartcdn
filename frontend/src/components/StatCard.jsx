import { TrendingUp, TrendingDown } from 'lucide-react';

const TINTS = {
  blue: { bg: '#EFF6FF', fg: '#2563EB' },
  green: { bg: '#ECFDF5', fg: '#16A34A' },
  orange: { bg: '#FFF7ED', fg: '#F97316' },
  purple: { bg: '#F5F3FF', fg: '#7C3AED' },
};

export default function StatCard({ icon: Icon, label, value, trend, trendUp, tint = 'blue' }) {
  const { bg, fg } = TINTS[tint] || TINTS.blue;

  return (
    <div className="card fade-up">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={19} color={fg} />
        </div>
        {trend && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600,
            color: trendUp ? '#16A34A' : '#DC2626',
          }}>
            {trendUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 4, color: 'var(--text-0)' }}>
        {value}
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-2)' }}>{label}</div>
    </div>
  );
}
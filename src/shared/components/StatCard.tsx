import { useEffect, useRef, useState } from 'react';

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  subLabel?: string;
  trend?: string;
  trendUp?: boolean;
  ringPct?: number;
  color: 'orange' | 'violet' | 'mint' | 'gold';
  animDelay?: number;
  icon: React.ReactNode;
}

const colorMap = {
  orange: { accent: '#ff6b35', bg: 'rgba(255,107,53,0.15)', top: '#ff6b35' },
  violet: { accent: '#9b7ffe', bg: 'rgba(124,92,252,0.15)', top: '#7c5cfc' },
  mint:   { accent: '#00e5a0', bg: 'rgba(0,229,160,0.15)',  top: '#00e5a0' },
  gold:   { accent: '#f5c842', bg: 'rgba(245,200,66,0.15)', top: '#f5c842' },
};

export default function StatCard({ label, value, suffix = '', subLabel, trend, trendUp, ringPct, color, animDelay = 300, icon }: StatCardProps) {
  const [displayVal, setDisplayVal] = useState(0);
  const [ringWidth, setRingWidth] = useState(0);
  const rafRef = useRef<number>(0);
  const { accent, bg, top } = colorMap[color];

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1400;
      let startTime: number | null = null;
      const step = (ts: number) => {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setDisplayVal(Math.round(ease * value));
        if (p < 1) rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
      setTimeout(() => setRingWidth(ringPct ?? 0), 200);
    }, animDelay);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafRef.current); };
  }, [value, ringPct, animDelay]);

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s',
        animation: 'fadeUp 0.5s ease both',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '14px 14px 0 0', background: top }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
      </div>

      <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1, color: accent }}>
        {displayVal.toLocaleString()}{suffix}
      </div>

      {subLabel && <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 4 }}>{subLabel}</div>}

      {ringPct !== undefined && (
        <div style={{ width: '100%', height: 4, background: 'var(--bg5)', borderRadius: 99, marginTop: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 99, background: accent, width: `${ringWidth}%`, transition: 'width 1.5s cubic-bezier(.4,0,.2,1)' }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        {subLabel && ringPct !== undefined && (
          <span style={{ fontSize: 11, color: 'var(--txt3)' }}>{ringPct}% of daily goal</span>
        )}
        {trend && (
          <span style={{ fontSize: 11, color: trendUp ? 'var(--mint)' : 'var(--red)', fontWeight: 500, marginLeft: 'auto' }}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { generateHeatmapData } from '../../shared/lib/mockData';

const COLORS = [
  'var(--bg5)',
  'rgba(124,92,252,0.25)',
  'rgba(124,92,252,0.5)',
  'rgba(124,92,252,0.8)',
  'var(--violet)',
];

export default function TrainingHeatmap() {
  const data = useMemo(() => generateHeatmapData(), []);

  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--txt3)', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 6 }}>
        26-Week Training Activity
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(26, 1fr)', gap: 2.5 }}>
        {data.map((val, i) => (
          <div
            key={i}
            title={`Intensity: ${val === 0 ? 'Rest' : val === 1 ? 'Light' : val === 2 ? 'Moderate' : val === 3 ? 'Hard' : 'Max'}`}
            style={{
              aspectRatio: '1',
              borderRadius: 2,
              background: COLORS[val],
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.4)'; (e.currentTarget as HTMLDivElement).style.zIndex = '5'; (e.currentTarget as HTMLDivElement).style.position = 'relative'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLDivElement).style.zIndex = '0'; }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--txt3)' }}>Less</span>
        {COLORS.map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--txt3)' }}>More</span>
      </div>
    </div>
  );
}

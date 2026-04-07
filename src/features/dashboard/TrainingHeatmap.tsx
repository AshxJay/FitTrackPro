import { useMemo } from 'react';
import { generateHeatmapData } from '../../shared/lib/mockData';
import type { WorkoutSession } from '../../shared/types';

const COLORS = [
  'var(--bg5)',
  'rgba(124,92,252,0.25)',
  'rgba(124,92,252,0.5)',
  'rgba(124,92,252,0.8)',
  'var(--violet)',
];

function buildHeatmapFromSessions(sessions: WorkoutSession[]): number[] {
  // Build a set of ISO date strings → intensity (1–4 based on volume)
  const dateVolume = new Map<string, number>();
  sessions.forEach(s => {
    const d = s.completedAt instanceof Date ? s.completedAt : new Date(s.completedAt!);
    const key = d.toISOString().split('T')[0];
    const vol = s.totalVolume ?? 0;
    dateVolume.set(key, (dateVolume.get(key) ?? 0) + vol);
  });

  const result: number[] = [];
  const today = new Date();
  // Build 26 weeks x 7 days = 182 days, oldest first
  for (let i = 181; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const vol = dateVolume.get(key) ?? 0;
    if (vol === 0) {
      result.push(0);
    } else if (vol < 1000) {
      result.push(1);
    } else if (vol < 5000) {
      result.push(2);
    } else if (vol < 10000) {
      result.push(3);
    } else {
      result.push(4);
    }
  }
  return result;
}

interface Props {
  sessions?: WorkoutSession[];
}

export default function TrainingHeatmap({ sessions }: Props) {
  const data = useMemo(() => {
    if (sessions && sessions.length > 0) {
      return buildHeatmapFromSessions(sessions);
    }
    return generateHeatmapData();
  }, [sessions]);

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

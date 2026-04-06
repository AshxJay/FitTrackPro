import { mockSchedule } from '../../shared/lib/mockData';

const typeColors: Record<string, { bg: string; color: string; label: string }> = {
  strength:   { bg: 'rgba(124,92,252,0.2)', color: '#9b7ffe', label: 'Strength' },
  hypertrophy:{ bg: 'rgba(124,92,252,0.2)', color: '#9b7ffe', label: 'Hypertrophy' },
  hiit:       { bg: 'rgba(255,107,53,0.2)', color: '#ff6b35', label: 'HIIT' },
  cardio:     { bg: 'rgba(0,229,160,0.2)',  color: '#00e5a0', label: 'Cardio' },
  mobility:   { bg: 'rgba(90,180,255,0.2)', color: '#5ab4ff', label: 'Mobility' },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function WeekScheduleCard() {
  const todayDow = 1; // Monday

  const fullWeek = DAYS.map((day, i) => {
    const sched = mockSchedule.find(s => s.dayOfWeek === i + 1);
    return { day, sched, isToday: i + 1 === todayDow };
  });

  return (
    <div
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, transition: 'border-color 0.2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700 }}>This Week</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>Training schedule</div>
        </div>
        <span style={{ fontSize: 11, color: 'var(--violet2)', cursor: 'pointer' }}>Edit</span>
      </div>

      {fullWeek.map(({ day, sched, isToday }) => (
        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0,
            background: isToday ? 'var(--violet)' : 'var(--bg4)',
            color: isToday ? '#fff' : 'var(--txt2)',
          }}>
            {day}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sched ? sched.name : 'Rest Day'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 1 }}>
              {sched ? `${sched.estimatedDuration} min${isToday ? ' · Today' : ''}` : 'Active recovery'}
            </div>
          </div>
          {sched ? (
            <div style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, letterSpacing: '0.3px', flexShrink: 0, background: typeColors[sched.type]?.bg, color: typeColors[sched.type]?.color }}>
              {typeColors[sched.type]?.label}
            </div>
          ) : (
            <div style={{ padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, letterSpacing: '0.3px', flexShrink: 0, background: 'var(--bg4)', color: 'var(--txt3)' }}>Rest</div>
          )}
        </div>
      ))}
    </div>
  );
}

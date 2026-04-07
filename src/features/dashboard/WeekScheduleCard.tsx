import { useNavigate } from 'react-router-dom';

export default function WeekScheduleCard() {
  const navigate = useNavigate();

  return (
    <div
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, transition: 'border-color 0.2s', alignSelf: 'start', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700 }}>Training Cycle</div>
          <div style={{ fontSize: 11, color: 'var(--txt3)', marginTop: 2 }}>Build your custom routine</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 10px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--txt3)" strokeWidth="2" strokeLinecap="round"><path d="M12 4v16m8-8H4"/></svg>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--txt2)', marginBottom: 4 }}>No Program Assigned</div>
        <div style={{ fontSize: 12, color: 'var(--txt3)', lineHeight: 1.4 }}>Create a split or start a blank session from the logger.</div>
      </div>
      
      <button
        onClick={() => navigate('/workout')}
        style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--txt2)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
      >
        Setup Split
      </button>

    </div>
  );
}

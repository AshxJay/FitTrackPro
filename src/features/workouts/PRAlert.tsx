import { useEffect, useState } from 'react';
import type { PersonalRecord } from '../../shared/types';

interface PRAlertProps {
  pr: PersonalRecord;
  onDismiss: () => void;
}

function calcOneRM(w: number, r: number) {
  return Math.round(w * (1 + r / 30));
}

// Simple confetti using CSS
const CONFETTI_COLORS = ['#7c5cfc', '#00e5a0', '#f5c842', '#ff6b35', '#ff3b5c'];

export default function PRAlert({ pr, onDismiss }: PRAlertProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 5000);
    return () => clearTimeout(t);
  }, [pr]);

  const confettiPieces = Array.from({ length: 24 }, (_, i) => ({
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${0.8 + Math.random() * 0.6}s`,
    size: `${6 + Math.random() * 8}px`,
  }));

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
        }
        @keyframes prSlideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
        @keyframes prSlideOut {
          from { transform: translateY(0); opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }
      `}</style>

      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '16px 28px',
        background: 'linear-gradient(135deg, rgba(245,200,66,0.15), rgba(255,107,53,0.15))',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245,200,66,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        animation: visible ? 'prSlideIn 0.4s cubic-bezier(.4,0,.2,1) both' : 'prSlideOut 0.4s cubic-bezier(.4,0,.2,1) both',
        overflow: 'hidden',
      }}>
        {/* Confetti */}
        {confettiPieces.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, left: p.left,
            width: p.size, height: p.size,
            background: p.color, borderRadius: 2,
            animation: `confettiFall ${p.duration} ${p.delay} ease-out forwards`,
            pointerEvents: 'none',
          }} />
        ))}

        <span style={{ fontSize: 28 }}>🏆</span>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--gold)' }}>
            NEW PERSONAL RECORD
          </div>
          <div style={{ fontSize: 13, color: 'var(--txt2)', marginTop: 2 }}>
            <span style={{ fontWeight: 600, color: 'var(--txt)' }}>{pr.exerciseName}</span>
            {' — '}
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--gold)' }}>
              {pr.weight}kg × {pr.reps} reps
            </span>
            <span style={{ color: 'var(--txt3)', marginLeft: 8 }}>
              (Est. 1RM: {calcOneRM(pr.weight, pr.reps)}kg)
            </span>
          </div>
        </div>

        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
          style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--txt3)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
        >
          ✕
        </button>
      </div>
    </>
  );
}

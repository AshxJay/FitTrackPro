import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface VideoPlayerProps {
  ytId: string;
  title: string;
  onClose: () => void;
}

export default function VideoPlayer({ ytId, title, onClose }: VideoPlayerProps) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const content = (
    <div
      style={{
        position: 'fixed',
        bottom: expanded ? '50%' : 24,
        right: expanded ? '50%' : 24,
        transform: expanded ? 'translate(50%, 50%)' : 'none',
        width: expanded ? '80vw' : 320,
        height: expanded ? '80vh' : 180,
        maxWidth: expanded ? 1200 : 'none',
        maxHeight: expanded ? 800 : 'none',
        background: '#000',
        borderRadius: 16,
        boxShadow: expanded ? '0 0 0 100vw rgba(0,0,0,0.8), 0 20px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.5)',
        zIndex: 9999,
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border2)'
      }}
    >
      {/* Header Bar */}
      <div style={{
        height: 36,
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        flexShrink: 0
      }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--txt)', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
          {title}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ width: 24, height: 24, borderRadius: 6, background: 'transparent', border: 'none', color: 'var(--txt2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={expanded ? "Minimize to PiP" : "Expand to Fullscreen"}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {expanded ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            )}
          </button>
          <button
            onClick={onClose}
            style={{ width: 24, height: 24, borderRadius: 6, background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Close Video"
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,59,92,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </div>

      {/* Video Iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&modestbranding=1&rel=0`}
          title={title}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

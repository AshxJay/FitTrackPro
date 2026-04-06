import { useEffect, useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import OnboardingWizard from './OnboardingWizard';

type AuthView = 'login' | 'signup' | 'onboarding';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authLoading } = useAppStore();
  const [view, setView] = useState<AuthView>('login');


  // New signup → always show onboarding first
  useEffect(() => {
    if (isAuthenticated && view === 'onboarding') {
      // stay on onboarding until wizard completes
    }
  }, [isAuthenticated, view]);

  // Show a full-screen loader while Firebase resolves the session
  if (authLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: 'linear-gradient(135deg,var(--violet),var(--mint))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(124,92,252,0.4)',
          animation: 'pulseGlow 1.6s ease-in-out infinite',
        }}>
          <svg viewBox="0 0 24 24" fill="none" width="26" height="26">
            <path d="M6 12h4m4 0h4M10 12V8m4 4v4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            <rect x="2" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.8" />
            <rect x="18" y="10" width="4" height="4" rx="1.5" fill="#fff" opacity="0.8" />
          </svg>
        </div>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--txt3)' }}>
          Checking session…
        </span>
        <style>{`
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 8px 32px rgba(124,92,252,0.4); transform: scale(1); }
            50% { box-shadow: 0 8px 48px rgba(124,92,252,0.7); transform: scale(1.05); }
          }
        `}</style>
      </div>
    );
  }

  // Already logged in — but if they just signed up, show onboarding first
  if (isAuthenticated && view !== 'onboarding') return <>{children}</>;

  return (
    <div style={{ height: '100vh', overflow: 'auto', background: 'var(--bg)' }}>
      {view === 'login' && (
        <LoginPage onSwitchToSignup={() => setView('signup')} />
      )}
      {view === 'signup' && (
        <SignupPage
          onSwitchToLogin={() => setView('login')}
          onSignedUp={() => { setView('onboarding'); }}
        />
      )}
      {view === 'onboarding' && (
        <OnboardingWizard
          onComplete={() => setView('login')} // triggers re-render → isAuthenticated → children
        />
      )}
    </div>
  );
}

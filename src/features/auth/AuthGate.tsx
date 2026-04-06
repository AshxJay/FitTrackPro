import { useState } from 'react';
import { useAppStore } from '../../shared/stores/appStore';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import OnboardingWizard from './OnboardingWizard';

type AuthView = 'login' | 'signup' | 'onboarding';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppStore();
  const [view, setView] = useState<AuthView>('login');
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

  if (isAuthenticated) return <>{children}</>;

  return (
    <div style={{ height: '100vh', overflow: 'auto', background: 'var(--bg)' }}>
      {view === 'login' && (
        <LoginPage onSwitchToSignup={() => setView('signup')} />
      )}
      {view === 'signup' && (
        <SignupPage
          onSwitchToLogin={() => setView('login')}
          onSignedUp={(info) => { setUserInfo(info); setView('onboarding'); }}
        />
      )}
      {view === 'onboarding' && (
        <OnboardingWizard name={userInfo?.name ?? 'Athlete'} />
      )}
    </div>
  );
}

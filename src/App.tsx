import AuthGate from './features/auth/AuthGate';
import Sidebar from './shared/components/Sidebar';
import Topbar from './shared/components/Topbar';
import Dashboard from './features/dashboard/Dashboard';
import WorkoutLogger from './features/workouts/WorkoutLogger';
import WorkoutLibrary from './features/workouts/WorkoutLibrary';
import Analytics from './features/analytics/Analytics';
import NutritionTracker from './features/nutrition/NutritionTracker';
import AICoach from './features/ai-coach/AICoach';
import Community from './features/community/Community';
import Settings from './features/settings/Settings';
import { useAppStore } from './shared/stores/appStore';



function AppShell() {
  const { activeTab } = useAppStore();
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':  return <Dashboard />;
      case 'workouts':   return <WorkoutLibrary />;
      case 'log':        return <WorkoutLogger />;
      case 'nutrition':  return <NutritionTracker />;
      case 'analytics':  return <Analytics />;
      case 'social':     return <Community />;
      case 'ai-coach':   return <AICoach />;
      case 'profile':    return <Settings />;
      case 'settings':   return <Settings />;
      default:           return <Dashboard />;
    }
  };
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar />
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>{renderContent()}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthGate>
      <AppShell />
    </AuthGate>
  );
}

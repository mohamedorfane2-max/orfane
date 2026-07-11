import { useState } from 'react';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [view, setView] = useState<'landing' | 'admin_orders' | 'admin_settings'>('landing');

  return (
    <div className="min-h-screen bg-natural-bg selection:bg-natural-accent/20 selection:text-natural-dark">
      {view === 'landing' ? (
        <LandingPage onAdminAccess={(mode) => setView(mode === 'orders' ? 'admin_orders' : 'admin_settings')} />
      ) : view === 'admin_orders' ? (
        <AdminPanel mode="orders" onBack={() => setView('landing')} />
      ) : (
        <AdminPanel mode="settings" onBack={() => setView('landing')} />
      )}
    </div>
  );
}

import { useState } from 'react';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [view, setView] = useState<'landing' | 'admin'>('landing');

  return (
    <div className="min-h-screen bg-natural-bg selection:bg-natural-accent/20 selection:text-natural-dark">
      {view === 'landing' ? (
        <LandingPage onAdminAccess={() => setView('admin')} />
      ) : (
        <AdminPanel onBack={() => setView('landing')} />
      )}
    </div>
  );
}

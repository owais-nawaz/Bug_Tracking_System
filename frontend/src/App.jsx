import { useCallback, useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Notification from './components/shared/Notification';

const ROLE_LABEL = { Tester: 'QA Tester', Developer: 'Developer', QALead: 'QA Lead' };

function AppContent() {
  const { user, login, logout } = useAuth();
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = 'info') => setNotification({ message, type }), []);

  if (!user) return <AuthPage onLogin={login} />;

  // Bug reporting and dashboard tabs will be added in BTS-1 and BTS-2
  return (
    <div className="bts-layout">
      <header style={{ background: 'var(--bts-surface)', borderBottom: '1px solid var(--bts-border)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 }}>
          🐞 Bug Tracker
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--bts-text-muted)' }}>
            {user.username} · {ROLE_LABEL[user.role]}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sign out</button>
        </div>
      </header>

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <main className="bts-main">
        <h1 className="bts-page-title">Welcome, {user.username}! 👋</h1>
        <p style={{ color: 'var(--bts-text-muted)' }}>
          Signed in as <strong style={{ color: 'var(--bts-primary)' }}>{ROLE_LABEL[user.role]}</strong>.
          Bug reporting features are being built — check back soon.
        </p>
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}

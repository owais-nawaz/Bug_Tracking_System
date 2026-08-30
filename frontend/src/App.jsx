import { useCallback, useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Notification from './components/shared/Notification';
import BugSubmissionForm from './components/bugs/BugSubmissionForm';

const ROLE_LABEL = { Tester: 'QA Tester', Developer: 'Developer', QALead: 'QA Lead' };

function AppContent() {
  const { user, login, logout } = useAuth();
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab]       = useState('submit');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const notify = useCallback((message, type = 'info') => setNotification({ message, type }), []);

  if (!user) return <AuthPage onLogin={login} />;

  return (
    <div className="bts-layout">
      {/* Navbar — extracted into Navbar.jsx in BTS-2 */}
      <header className="bts-navbar">
        <span className="bts-navbar__brand">🐞 Bug Tracker Portal</span>
        <div className="bts-navbar__user">
          <span className="bts-navbar__role" style={{ fontSize: 13 }}>
            {user.username} · {ROLE_LABEL[user.role]}
          </span>
          <button className="btn-outline-white btn-sm" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Sub-navigation — extracted into SubNav.jsx in BTS-2 */}
      <div className="bts-subnav">
        {(user.role === 'Tester' || user.role === 'QALead') && (
          <button
            className={`bts-subnav__tab${activeTab === 'submit' ? ' bts-subnav__tab--active' : ''}`}
            onClick={() => setActiveTab('submit')}
          >
            + Report Bug
          </button>
        )}
      </div>

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <main className="bts-main">
        {activeTab === 'submit' && (user.role === 'Tester' || user.role === 'QALead') && (
          <BugSubmissionForm currentUser={user} onNotify={notify} onSuccess={() => setRefreshTrigger(r => r + 1)} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppContent /></AuthProvider>;
}

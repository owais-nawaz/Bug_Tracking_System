import { useCallback, useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/auth/AuthPage';
import Navbar from './components/shared/Navbar';
import SubNav from './components/shared/SubNav';
import Notification from './components/shared/Notification';
import BugDashboard from './components/bugs/BugDashboard';
import BugSubmissionForm from './components/bugs/BugSubmissionForm';

function AppContent() {
  const { user, login, logout } = useAuth();
  const [activeTab, setActiveTab]           = useState('dashboard');
  const [notification, setNotification]     = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const notify = useCallback((message, type = 'info') => setNotification({ message, type }), []);

  if (!user) return <AuthPage onLogin={login} />;

  return (
    <div className="bts-layout">
      <Navbar user={user} onLogout={logout} />
      <SubNav user={user} activeTab={activeTab} onTabChange={setActiveTab} />

      {notification && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}

      <main className="bts-main">
        {activeTab === 'dashboard' && (
          <BugDashboard
            currentUser={user} onNotify={notify} refreshTrigger={refreshTrigger}
            onClaim={() => {}} onResolve={() => {}} onVerify={() => {}}
          />
        )}
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

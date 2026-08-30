import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthPage({ onLogin }) {
  const [view, setView] = useState('login');
  return (
    <div className="bts-auth">
      <header className="bts-auth__header">
        <span className="material-icons bts-auth__header-icon">bug_report</span>
        <div>
          <h1 className="bts-auth__header-title">Bug Tracker Portal</h1>
          <p className="bts-auth__header-sub">Role-based Software Quality Portal</p>
        </div>
      </header>
      <div className="bts-auth__body">
        <div className="bts-auth__card">
          {view === 'login'
            ? <LoginForm onLogin={onLogin} onSwitchToSignup={() => setView('signup')} />
            : <SignupForm onSignup={onLogin} onSwitchToLogin={() => setView('login')} />}
        </div>
      </div>
    </div>
  );
}

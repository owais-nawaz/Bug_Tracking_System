import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

export default function AuthPage({ onLogin }) {
  const [view, setView] = useState('login');
  return (
    <div className="bts-auth">
      <div className="bts-auth__brand">
        <div className="bts-auth__brand-icon">🐞</div>
        <h1>Bug Tracking System</h1>
        <p>IFN636 Assessment 1 — Role-Based Defect Management</p>
      </div>
      <div className="bts-auth__card">
        {view === 'login'
          ? <LoginForm onLogin={onLogin} onSwitchToSignup={() => setView('signup')} />
          : <SignupForm onSignup={onLogin} onSwitchToLogin={() => setView('login')} />}
      </div>
    </div>
  );
}

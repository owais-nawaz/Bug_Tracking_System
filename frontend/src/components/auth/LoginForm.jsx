import { useState } from 'react';
import { authApi } from '../../api/client';

const DEMOS = [
  { username: 'tester_sarah', password: 'password123', label: 'QA Tester',  icon: 'search'    },
  { username: 'dev_alex',     password: 'password123', label: 'Developer',  icon: 'code'      },
  { username: 'qa_lead',      password: 'password123', label: 'QA Lead',    icon: 'verified'  },
];

export default function LoginForm({ onLogin, onSwitchToSignup }) {
  const [form, setForm]       = useState({ username: '', password: '' });
  const [errors, setErrors]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);

  const change = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErrors([]); };

  async function submit(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.password) return setErrors(['Username and password are required.']);
    setLoading(true);
    try {
      const data = await authApi.login({ username: form.username.trim(), password: form.password });
      onLogin({ ...data.user, token: data.token });
    }
    catch (err) { setErrors([err.message]); }
    finally { setLoading(false); }
  }

  async function demoLogin(d) {
    setActiveDemo(d.username); setLoading(true); setErrors([]);
    try {
      const data = await authApi.login({ username: d.username, password: d.password });
      onLogin({ ...data.user, token: data.token });
    }
    catch (err) { setErrors([err.message]); }
    finally { setLoading(false); setActiveDemo(null); }
  }

  return (
    <div>
      <div className="bts-demo-section">
        <span className="bts-demo-section__label">
          <span className="material-icons bts-demo-section__icon">bolt</span>
          Quick Demo Login
        </span>
        <div className="bts-demo-btns">
          {DEMOS.map(d => (
            <button
              key={d.username}
              className={`bts-demo-btn${activeDemo === d.username ? ' bts-demo-btn--active' : ''}`}
              onClick={() => demoLogin(d)}
              disabled={loading}
            >
              <span className="material-icons bts-demo-btn__icon">{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bts-form__errors">
          <span className="material-icons bts-form__error-icon">error_outline</span>
          {errors.join(' ')}
        </div>
      )}

      <form onSubmit={submit}>
        <div className="bts-form__group">
          <label className="bts-form__label">Username</label>
          <div className="bts-input-wrap">
            <span className="material-icons bts-input-icon">person</span>
            <input name="username" value={form.username} onChange={change} placeholder="Enter your username" autoFocus />
          </div>
        </div>
        <div className="bts-form__group">
          <label className="bts-form__label">Password</label>
          <div className="bts-input-wrap">
            <span className="material-icons bts-input-icon">lock</span>
            <input type="password" name="password" value={form.password} onChange={change} placeholder="Enter your password" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading
            ? <><span className="material-icons btn-icon">hourglass_top</span> Signing in…</>
            : <><span className="material-icons btn-icon">login</span> Login</>}
        </button>
      </form>

      <p className="bts-auth__switch">
        Need account?{' '}
        <button onClick={onSwitchToSignup}>Sign Up</button>
        {' / '}
        <button onClick={onSwitchToSignup}>Register</button>
      </p>
    </div>
  );
}

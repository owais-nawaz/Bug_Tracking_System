import { useState } from 'react';
import { authApi } from '../../api/client';

const DEMOS = [
  { username: 'tester_sarah', password: 'password123', icon: '🔍', label: 'tester_sarah', roleTag: 'Tester' },
  { username: 'dev_alex',     password: 'password123', icon: '👨‍💻', label: 'dev_alex',     roleTag: 'Developer' },
  { username: 'qa_lead',      password: 'password123', icon: '✅', label: 'qa_lead',      roleTag: 'QA Lead' },
];

export default function LoginForm({ onLogin, onSwitchToSignup }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const change = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErrors([]); };

  async function submit(e) {
    e.preventDefault();
    if (!form.username.trim() || !form.password) return setErrors(['Username and password are required.']);
    setLoading(true);
    try { onLogin((await authApi.login(form)).user); }
    catch (err) { setErrors([err.message]); }
    finally { setLoading(false); }
  }

  async function demoLogin(d) {
    setLoading(true); setErrors([]);
    try { onLogin((await authApi.login({ username: d.username, password: d.password })).user); }
    catch (err) { setErrors([err.message]); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <h2 className="bts-auth__title">Sign in</h2>
      {errors.length > 0 && <div className="bts-form__errors"><ul>{errors.map((e,i) => <li key={i}>{e}</li>)}</ul></div>}
      <form onSubmit={submit}>
        <div className="bts-form__group">
          <label className="bts-form__label">Username</label>
          <input name="username" value={form.username} onChange={change} placeholder="Enter username" autoFocus />
        </div>
        <div className="bts-form__group">
          <label className="bts-form__label">Password</label>
          <input type="password" name="password" value={form.password} onChange={change} placeholder="Enter password" />
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
      <div className="bts-demo-section">
        <span className="bts-demo-section__label">⚡ Quick Demo Login</span>
        <div className="bts-demo-btns">
          {DEMOS.map(d => (
            <button key={d.username} className="bts-demo-btn" onClick={() => demoLogin(d)} disabled={loading}>
              <span>{d.icon}</span>
              <span className="bts-demo-btn__name">{d.label}</span>
              <span className="bts-demo-btn__role">{d.roleTag}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="bts-auth__switch">No account? <button onClick={onSwitchToSignup}>Register here</button></p>
    </div>
  );
}

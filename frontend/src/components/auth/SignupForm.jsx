import { useState } from 'react';
import { authApi } from '../../api/client';

export default function SignupForm({ onSignup, onSwitchToLogin }) {
  const [form, setForm]       = useState({ username: '', email: '', password: '', role: 'Tester' });
  const [errors, setErrors]   = useState([]);
  const [loading, setLoading] = useState(false);

  const change = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErrors([]); };

  async function submit(e) {
    e.preventDefault();
    const errs = [];
    if (form.username.trim().length < 3) errs.push('Username must be at least 3 characters.');
    if (!form.email.includes('@'))       errs.push('Valid email is required.');
    if (form.password.length < 4)        errs.push('Password must be at least 4 characters.');
    if (errs.length) return setErrors(errs);
    setLoading(true);
    try { const data = await authApi.signup(form);
    onSignup({ ...data.user, token: data.token }); }
    catch (err) { setErrors([err.message]); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <h2 className="bts-auth__title">
        <span className="material-icons bts-auth__title-icon">person_add</span>
        Create account
      </h2>

      {errors.length > 0 && (
        <div className="bts-form__errors">
          <span className="material-icons bts-form__error-icon">error_outline</span>
          <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}

      <form onSubmit={submit}>
        <div className="bts-form__group">
          <label className="bts-form__label">Username <span className="required">*</span></label>
          <div className="bts-input-wrap">
            <span className="material-icons bts-input-icon">person</span>
            <input name="username" value={form.username} onChange={change} placeholder="min. 3 characters" autoFocus />
          </div>
        </div>
        <div className="bts-form__group">
          <label className="bts-form__label">Email <span className="required">*</span></label>
          <div className="bts-input-wrap">
            <span className="material-icons bts-input-icon">email</span>
            <input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" />
          </div>
        </div>
        <div className="bts-form__group">
          <label className="bts-form__label">Password <span className="required">*</span></label>
          <div className="bts-input-wrap">
            <span className="material-icons bts-input-icon">lock</span>
            <input type="password" name="password" value={form.password} onChange={change} placeholder="min. 4 characters" />
          </div>
        </div>
        <div className="bts-form__group">
          <label className="bts-form__label">Role <span className="required">*</span></label>
          <div className="bts-input-wrap">
            <span className="material-icons bts-input-icon">manage_accounts</span>
            <select name="role" value={form.role} onChange={change}>
              <option value="Tester">QA Tester</option>
              <option value="Developer">Developer</option>
              <option value="QALead">QA Lead</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading
            ? <><span className="material-icons btn-icon">hourglass_top</span> Creating…</>
            : <><span className="material-icons btn-icon">person_add</span> Create Account</>}
        </button>
      </form>

      <p className="bts-auth__switch">
        Have an account? <button onClick={onSwitchToLogin}>Sign in</button>
      </p>
    </div>
  );
}

import { useState } from 'react';
import { bugsApi } from '../../api/client';

const MODULES = ['UI Components','Backend API','User Settings','Database','Authentication','Performance','Other'];
const LEVELS  = ['Low','Medium','High','Critical'];
const EMPTY   = { title: '', module: '', severity: 'Medium', priority: 'Medium', description: '' };

export default function BugSubmissionForm({ currentUser, onNotify, onSuccess }) {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState([]);
  const [loading, setLoading] = useState(false);

  const change = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErrors([]); };

  function validate() {
    const e = [];
    if (form.title.trim().length < 5)        e.push('Title must be at least 5 characters.');
    if (!form.module)                        e.push('Module is required.');
    if (form.description.trim().length < 10) e.push('Description must be at least 10 characters.');
    return e;
  }

  async function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (errs.length) return setErrors(errs);
    setLoading(true);
    try {
      await bugsApi.create(form, currentUser);
      onNotify('Bug submitted successfully!', 'success');
      setForm(EMPTY);
      onSuccess?.();
    } catch (err) { setErrors([err.message]); }
    finally { setLoading(false); }
  }

  return (
    <div className="bts-form">
      <h2 className="bts-form__title">Report New Bug Ticket</h2>

      {errors.length > 0 && (
        <div className="bts-form__errors"><ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
      )}

      <form onSubmit={submit}>
        {/* Title — full width */}
        <div className="bts-form__group">
          <label className="bts-form__label">Bug Title: <span className="required">*</span></label>
          <input name="title" value={form.title} onChange={change}
            placeholder="eg: Navigation dropdown overlaps on mobile" />
          <span className="bts-form__hint">Minimum 5 characters</span>
        </div>

        {/* Module + Severity — side by side */}
        <div className="bts-form__row">
          <div className="bts-form__group">
            <label className="bts-form__label">Module / Component: <span className="required">*</span></label>
            <select name="module" value={form.module} onChange={change}>
              <option value="">Select Module</option>
              {MODULES.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="bts-form__group">
            <label className="bts-form__label">Severity Level: <span className="required">*</span></label>
            <select name="severity" value={form.severity} onChange={change}>
              {LEVELS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Priority kept in state (default 'Medium') and submitted, but hidden from UI per Figma */}

        {/* Description — full width */}
        <div className="bts-form__group">
          <label className="bts-form__label">Detailed Steps to Reproduce &amp; Expected Behavior <span className="required">*</span></label>
          <textarea name="description" value={form.description} onChange={change} rows={5}
            placeholder="1. Open website on mobile... 2. Click hamburger menu... 3. Observe overlap"
            style={{ resize: 'vertical' }} />
          <span className="bts-form__hint">Minimum 10 characters</span>
        </div>

        {/* Cancel + Submit — side by side */}
        <div className="bts-form__actions">
          <button type="button" className="btn btn-ghost" onClick={() => setForm(EMPTY)} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting…' : (<><span className="material-icons btn-icon">send</span> Submit bug report</>)}
          </button>
        </div>
      </form>
    </div>
  );
}

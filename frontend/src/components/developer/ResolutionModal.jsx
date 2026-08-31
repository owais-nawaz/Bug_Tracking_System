import { useState } from 'react';
import { bugsApi } from '../../api/client';

const TYPES = ['Fixed', 'Workaround', "Won't Fix", 'Duplicate', 'Cannot Reproduce'];

export default function ResolutionModal({ bug, currentUser, onSuccess, onClose, onNotify }) {
  const [form, setForm]       = useState({ resolutionType: 'Fixed', resolutionNotes: '' });
  const [errors, setErrors]   = useState([]);
  const [loading, setLoading] = useState(false);
  const id = bug.ticketId || bug.id;

  const change = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErrors([]); };

  async function submit(e) {
    e.preventDefault();
    if (form.resolutionNotes.trim().length < 5)
      return setErrors(['Resolution notes must be at least 5 characters.']);
    setLoading(true);
    try {
      await bugsApi.resolve(id, form, currentUser);
      onNotify(`BUG-${id} marked as Resolved ✅`, 'success');
      onSuccess();
    } catch (err) { setErrors([err.message]); }
    finally { setLoading(false); }
  }

  return (
    <div className="bts-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bts-modal">
        <div className="bts-modal__header">
          <h3 className="bts-modal__title">🔧 Log Resolution — BUG-{id}</h3>
          <button className="bts-modal__close" onClick={onClose}>×</button>
        </div>

        <div className="bts-modal__bug-info">
          <strong>{bug.title}</strong>
          {bug.module} · {bug.severity} · {bug.priority}
        </div>

        {errors.length > 0 && (
          <div className="bts-form__errors" style={{ marginBottom: 16 }}>
            <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="bts-form__group">
            <label className="bts-form__label">Resolution Type <span className="required">*</span></label>
            <select name="resolutionType" value={form.resolutionType} onChange={change}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="bts-form__group">
            <label className="bts-form__label">Fix Notes <span className="required">*</span></label>
            <textarea name="resolutionNotes" value={form.resolutionNotes} onChange={change} rows={4}
              placeholder="Describe the fix applied (min. 5 chars)…" style={{ resize: 'vertical' }} autoFocus />
            <span className="bts-form__hint">Minimum 5 characters</span>
          </div>
          <div className="bts-modal__actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

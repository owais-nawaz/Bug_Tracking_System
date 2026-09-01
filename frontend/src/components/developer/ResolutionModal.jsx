import { useState } from 'react';
import { bugsApi } from '../../api/client';

const TYPES = ['Fixed (Code Patch Applied)', 'Workaround', "Won't Fix", 'Duplicate', 'Cannot Reproduce'];

export default function ResolutionModal({ bug, currentUser, onSuccess, onClose, onNotify }) {
  const [form, setForm]       = useState({ resolutionType: TYPES[0], resolutionNotes: '' });
  const [errors, setErrors]   = useState([]);
  const [loading, setLoading] = useState(false);
  const id = bug.ticketId || bug.id;

  const change = e => { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setErrors([]); };

  async function submit(e) {
    e.preventDefault();
    if (form.resolutionNotes.trim().length < 10)
      return setErrors(['Detailed steps must be at least 10 characters.']);
    setLoading(true);
    try {
      await bugsApi.resolve(id, form, currentUser);
      onNotify(`BUG-${id} marked as Resolved`, 'success');
      onSuccess();
    } catch (err) { setErrors([err.message]); }
    finally { setLoading(false); }
  }

  return (
    <div className="bts-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bts-modal">
        <div className="bts-modal__header bts-modal__header--workflow">
          <h3 className="bts-modal__title">
            <span className="material-icons" style={{ fontSize: 20 }}>build</span>
            Workflow 2: Resolve BUG-{id}
          </h3>
          <button className="bts-modal__close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="bts-modal__bug-info">
          <strong style={{ display: 'inline', color: 'var(--bts-text)' }}>Fixing:</strong> {bug.title}
        </div>

        {errors.length > 0 && (
          <div className="bts-form__errors" style={{ marginBottom: 16 }}>
            <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="bts-form__group">
            <label className="bts-form__label">Resolution Classification <span className="required">*</span></label>
            <select name="resolutionType" value={form.resolutionType} onChange={change}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="bts-form__group">
            <label className="bts-form__label">Detailed Steps to Reproduce &amp; Expected Behavior <span className="required">*</span></label>
            <textarea name="resolutionNotes" value={form.resolutionNotes} onChange={change} rows={4}
              placeholder="Eg: Updated z-index in style.css" style={{ resize: 'vertical' }} autoFocus />
            <span className="bts-form__hint">Minimum 10 characters</span>
          </div>
          <div className="bts-modal__actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save and Mark Resolved'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

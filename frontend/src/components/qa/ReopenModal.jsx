import { useState } from 'react';
import { bugsApi } from '../../api/client';

export default function ReopenModal({ bug, currentUser, onSuccess, onClose, onNotify }) {
  const [qaNotes, setQaNotes] = useState('');
  const [errors, setErrors]   = useState([]);
  const [loading, setLoading] = useState(false);
  const id = bug.ticketId || bug.id;

  async function submit(e) {
    e.preventDefault();
    if (qaNotes.trim().length < 5) return setErrors(['Regression notes must be at least 5 characters.']);
    setLoading(true);
    try {
      await bugsApi.verify(id, { action: 'reopen', qaNotes }, currentUser);
      onNotify(`BUG-${id} re-opened for rework`, 'info');
      onSuccess();
    } catch (err) { setErrors([err.message]); }
    finally { setLoading(false); }
  }

  return (
    <div className="bts-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bts-modal">
        <div className="bts-modal__header bts-modal__header--workflow">
          <h3 className="bts-modal__title">
            <span className="material-icons" style={{ fontSize: 20 }}>replay</span>
            Workflow 3: Re-open BUG-{id}
          </h3>
          <button className="bts-modal__close" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="bts-modal__bug-info">
          <strong style={{ display: 'inline', color: 'var(--bts-text)' }}>Auditing:</strong> {bug.title}
        </div>

        {errors.length > 0 && (
          <div className="bts-form__errors" style={{ marginBottom: 16 }}>
            <ul>{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}

        <form onSubmit={submit}>
          <div className="bts-form__group">
            <label className="bts-form__label">Regression Notes <span className="required">*</span></label>
            <textarea value={qaNotes} onChange={e => { setQaNotes(e.target.value); setErrors([]); }}
              rows={4} placeholder="Eg: Overlap still occurs on iOS Safari at 375px width."
              style={{ resize: 'vertical' }} autoFocus />
            <span className="bts-form__hint">Minimum 5 characters</span>
          </div>
          <div className="bts-modal__actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-reopen" disabled={loading}>
              {loading ? 'Submitting…' : 'Confirm Re-Open'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

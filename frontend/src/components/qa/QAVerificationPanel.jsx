import { useState, useEffect, useCallback } from 'react';
import { bugsApi } from '../../api/client';
import StatusBadge from '../shared/StatusBadge';

function QACard({ bug, onVerify }) {
  const [showReopen, setShowReopen] = useState(false);
  const [qaNotes, setQaNotes]       = useState('');
  const [noteError, setNoteError]   = useState('');
  const [loading, setLoading]       = useState(false);
  const id = bug.ticketId || bug.id;

  async function close() {
    setLoading(true);
    try { await onVerify(bug, 'close', null); }
    finally { setLoading(false); }
  }

  async function reopen() {
    if (qaNotes.trim().length < 5) return setNoteError('Regression notes must be at least 5 characters.');
    setLoading(true);
    try { await onVerify(bug, 'reopen', qaNotes); }
    finally { setLoading(false); }
  }

  return (
    <div className="bts-qa-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span className="bug-card__id">BUG-{id}</span>
        <StatusBadge text={bug.status} type="status" />
        <StatusBadge text={bug.severity} type="severity" />
      </div>

      <div style={{ fontWeight: 600, marginBottom: 4 }}>{bug.title}</div>

      <div className="bts-qa-card__meta">
        <span>Module: <strong style={{ color: 'var(--bts-text)' }}>{bug.module}</strong></span>
        <span>Fixed by: <strong style={{ color: 'var(--bts-text)' }}>{bug.assignee}</strong></span>
      </div>

      {bug.resolutionNotes && (
        <div className="bts-qa-card__resolution">
          <strong>Developer Fix ({bug.resolutionType || 'Fixed'}):</strong> {bug.resolutionNotes}
        </div>
      )}

      <div className="bts-qa-card__actions">
        <button className="btn btn-success btn-sm" onClick={close} disabled={loading || showReopen}>
          Verify &amp; Close
        </button>
        <button className="btn btn-danger btn-sm"
          onClick={() => { setShowReopen(s => !s); setNoteError(''); setQaNotes(''); }}
          disabled={loading}>
          Re-Open Bug
        </button>
      </div>

      {showReopen && (
        <div className="bts-qa-card__reopen-section">
          <textarea rows={3} value={qaNotes}
            onChange={e => { setQaNotes(e.target.value); setNoteError(''); }}
            placeholder="Mandatory: why did the fix fail? (regression notes, min. 5 chars)"
            style={{ resize: 'vertical', fontSize: 12 }} />
          {noteError && <p style={{ color: 'var(--bts-danger)', fontSize: 12 }}>{noteError}</p>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-danger btn-sm" onClick={reopen} disabled={loading}>
              {loading ? 'Submitting…' : 'Confirm Re-Open'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowReopen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QAVerificationPanel({ currentUser, onNotify }) {
  const [bugs, setBugs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBugs((await bugsApi.getAll({ status: 'Resolved' })).bugs || []); }
    catch (err) { onNotify(err.message, 'error'); }
    finally { setLoading(false); }
  }, [onNotify]);

  useEffect(() => { load(); }, [load, refresh]);

  async function handleVerify(bug, action, qaNotes) {
    const id = bug.ticketId || bug.id;
    try {
      await bugsApi.verify(id, { action, qaNotes }, currentUser);
      onNotify(action === 'close' ? `BUG-${id} verified and Closed ✅` : `BUG-${id} re-opened for rework 🔄`,
        action === 'close' ? 'success' : 'info');
      setRefresh(r => r + 1);
    } catch (err) { onNotify(err.message, 'error'); }
  }

  if (loading) return <div className="bts-loading">Loading resolved tickets…</div>;

  return (
    <div>
      <div className="bts-section-header">
        <h1 className="bts-page-title">
          ✅ QA Verification Panel <span className="bts-count-badge">{bugs.length}</span>
        </h1>
      </div>

      {bugs.length === 0 ? (
        <div className="bts-empty">
          <div className="bts-empty__icon">🎉</div>
          <div className="bts-empty__title">No resolved tickets awaiting verification</div>
          <p>Resolved tickets from developers appear here for review.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {bugs.map(b => (
            <QACard key={b._id || b.ticketId} bug={b} onVerify={handleVerify} />
          ))}
        </div>
      )}
    </div>
  );
}

import StatusBadge from '../shared/StatusBadge';

export default function BugCard({ bug, currentUser, onClaim, onResolve, onVerify }) {
  const id = bug.ticketId || bug.id;
  const canClaim   = bug.status === 'Open'        && currentUser?.role === 'Developer' && (bug.assignee === 'Unassigned' || !bug.assignee);
  const canResolve = bug.status === 'In Progress' && currentUser?.role === 'Developer' && bug.assignee === currentUser?.username;
  const canVerify  = bug.status === 'Resolved'    && currentUser?.role === 'QALead';

  return (
    <div className="bug-card">
      <div className="bug-card__header">
        <span className="bug-card__id">BUG-{id}</span>
        <StatusBadge text={bug.status} type="status" />
      </div>

      <div className="bug-card__title">{bug.title}</div>

      <div className="bug-card__tags">
        <span>Module: <strong>{bug.module}</strong></span>
        <span>·</span>
        <span>Severity: <strong>{bug.severity}</strong></span>
      </div>

      <p className="bug-card__desc">{bug.description}</p>

      {bug.resolutionNotes && (
        <div className="bug-card__resolution-notes">
          <strong>Resolution:</strong> {bug.resolutionNotes}
        </div>
      )}
      {bug.qaNotes && (
        <div className="bug-card__qa-notes">
          <strong>QA Notes:</strong> {bug.qaNotes}
        </div>
      )}

      <div className="bug-card__meta">
        <span>Rep: <strong>{bug.reporter}</strong></span>
        <span>Dev: <strong>{bug.assignee || 'Unassigned'}</strong></span>
      </div>

      {(canClaim || canResolve || canVerify) && (
        <div className="bug-card__actions">
          {canClaim   && <button className="btn btn-primary btn-full" onClick={() => onClaim(bug)}>Claim and Start Work</button>}
          {canResolve && <button className="btn btn-success btn-full" onClick={() => onResolve(bug)}>Submit Resolution</button>}
          {canVerify  && <>
            <button className="btn btn-success btn-sm" onClick={() => onVerify(bug, 'close', null)}>Verify &amp; Close</button>
            <button className="btn btn-danger btn-sm"  onClick={() => onVerify(bug, 'reopen', null)}>Re-Open</button>
          </>}
        </div>
      )}
    </div>
  );
}

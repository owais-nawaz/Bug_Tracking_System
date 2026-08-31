import { useState, useEffect, useCallback } from 'react';
import { bugsApi } from '../../api/client';
import BugCard from '../bugs/BugCard';

export default function DeveloperWorkspace({ currentUser, onNotify, onResolve }) {
  const [bugs, setBugs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBugs((await bugsApi.getAll({})).bugs || []); }
    catch (err) { onNotify(err.message, 'error'); }
    finally { setLoading(false); }
  }, [onNotify]);

  useEffect(() => { load(); }, [load, refresh]);

  async function handleClaim(bug) {
    const id = bug.ticketId || bug.id;
    try {
      await bugsApi.claim(id, currentUser);
      onNotify(`BUG-${id} claimed! Status → In Progress 🔧`, 'success');
      setRefresh(r => r + 1);
    } catch (err) { onNotify(err.message, 'error'); }
  }

  const unassigned = bugs.filter(b => b.status === 'Open' && (b.assignee === 'Unassigned' || !b.assignee));
  const myActive   = bugs.filter(b => b.status === 'In Progress' && b.assignee === currentUser?.username);

  if (loading) return <div className="bts-loading">Loading work queue…</div>;

  return (
    <div>
      <div className="bts-dev-section">
        <h2 className="bts-dev-section__title">
          📋 Available to Claim <span className="bts-count-badge">{unassigned.length}</span>
        </h2>
        {unassigned.length === 0 ? (
          <div className="bts-empty" style={{ padding: 24 }}>
            <div className="bts-empty__icon" style={{ fontSize: 32 }}>🎉</div>
            <div className="bts-empty__title">No unassigned tickets</div>
          </div>
        ) : (
          <div className="bug-grid">
            {unassigned.map(b => (
              <BugCard key={b._id || b.ticketId} bug={b} currentUser={currentUser}
                onClaim={handleClaim} onResolve={onResolve} onVerify={() => {}} />
            ))}
          </div>
        )}
      </div>

      <div className="bts-dev-section">
        <h2 className="bts-dev-section__title">
          ⚡ My Active Bugs <span className="bts-count-badge">{myActive.length}</span>
        </h2>
        {myActive.length === 0 ? (
          <div className="bts-empty" style={{ padding: 24 }}>
            <div className="bts-empty__icon" style={{ fontSize: 32 }}>✅</div>
            <div className="bts-empty__title">No active bugs</div>
            <p>Claim a ticket above to start working.</p>
          </div>
        ) : (
          <div className="bug-grid">
            {myActive.map(b => (
              <BugCard key={b._id || b.ticketId} bug={b} currentUser={currentUser}
                onClaim={() => {}} onResolve={onResolve} onVerify={() => {}} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

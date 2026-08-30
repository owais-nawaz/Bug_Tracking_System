import { useState, useEffect, useCallback } from 'react';
import { bugsApi } from '../../api/client';
import BugCard from './BugCard';
import BugFilters from './BugFilters';

const DEFAULT = { status: 'All', priority: 'All', search: '' };

export default function BugDashboard({ currentUser, onNotify, refreshTrigger, onClaim, onResolve, onVerify }) {
  const [bugs, setBugs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBugs((await bugsApi.getAll(filters)).bugs || []); }
    catch (err) { onNotify(err.message, 'error'); }
    finally { setLoading(false); }
  }, [filters, onNotify]);

  useEffect(() => { load(); }, [load, refreshTrigger]);

  if (loading) return <div className="bts-loading">Loading tickets…</div>;

  return (
    <div>
      <BugFilters filters={filters} onChange={setFilters} />
      {bugs.length === 0 ? (
        <div className="bts-empty">
          <div className="bts-empty__icon">🐛</div>
          <div className="bts-empty__title">No tickets found</div>
          <p>Adjust your filters or submit a new bug report.</p>
        </div>
      ) : (
        <div className="bug-grid">
          {bugs.map(b => (
            <BugCard key={b._id || b.id || b.ticketId} bug={b} currentUser={currentUser}
              onClaim={onClaim} onResolve={onResolve} onVerify={onVerify} />
          ))}
        </div>
      )}
    </div>
  );
}

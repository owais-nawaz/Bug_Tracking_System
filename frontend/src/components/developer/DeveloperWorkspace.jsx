import { useState, useEffect, useCallback } from 'react';
import { bugsApi } from '../../api/client';
import BugCard from '../bugs/BugCard';
import BugFilters from '../bugs/BugFilters';
import ResolutionModal from './ResolutionModal';

const DEFAULT = { status: 'All', priority: 'All', search: '' };

export default function DeveloperWorkspace({ currentUser, onNotify }) {
  const [bugs, setBugs]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState(DEFAULT);
  const [refresh, setRefresh]       = useState(0);
  const [resolveBug, setResolveBug] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setBugs((await bugsApi.getAll(filters)).bugs || []); }
    catch (err) { onNotify(err.message, 'error'); }
    finally { setLoading(false); }
  }, [filters, onNotify]);

  useEffect(() => { load(); }, [load, refresh]);

  async function handleClaim(bug) {
    const id = bug.ticketId || bug.id;
    try {
      await bugsApi.claim(id, currentUser);
      onNotify(`BUG-${id} claimed! Status changed to In Progress`, 'success');
      setRefresh(r => r + 1);
    } catch (err) { onNotify(err.message, 'error'); }
  }

  if (loading) return <div className="bts-loading">Loading work queue…</div>;

  return (
    <div>
      {/* <div className="bts-workspace-heading">
        <span className="material-icons">engineering</span>
        Developer Workspace
      </div>*/}

      <BugFilters filters={filters} onChange={setFilters} />

      {bugs.length === 0 ? (
        <div className="bts-empty">
          <span className="material-icons bts-empty__icon">bug_report</span>
          <div className="bts-empty__title">No tickets found</div>
          <p>Adjust your filters or wait for new tickets to be reported.</p>
        </div>
      ) : (
        <div className="bug-grid">
          {bugs.map(b => (
            <BugCard key={b._id || b.ticketId} bug={b} currentUser={currentUser}
              onClaim={handleClaim} onResolve={setResolveBug} />
          ))}
        </div>
      )}

      {resolveBug && (
        <ResolutionModal
          bug={resolveBug}
          currentUser={currentUser}
          onSuccess={() => { setResolveBug(null); setRefresh(r => r + 1); }}
          onClose={() => setResolveBug(null)}
          onNotify={onNotify}
        />
      )}
    </div>
  );
}

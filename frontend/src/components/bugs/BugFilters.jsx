import { useState, useEffect } from 'react';

const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed', 'Re-opened'];

export default function BugFilters({ filters, onChange }) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce: only notify the parent (and trigger a fetch) after the user pauses typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput });
      }
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="bts-filter-bar">
      <div className="bts-filter-bar__pills">
        {STATUSES.map(s => (
          <button key={s}
            className={`bts-filter-pill${filters.status === s ? ' bts-filter-pill--active' : ''}`}
            onClick={() => onChange({ ...filters, status: s, search: searchInput })}>
            {s}
          </button>
        ))}
      </div>
      <input className="bts-filter-bar__search" type="text"
        placeholder="Search title, description, or ID"
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)} />
    </div>
  );
}

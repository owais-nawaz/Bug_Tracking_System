const STATUSES = ['All', 'Open', 'In Progress', 'Resolved', 'Closed', 'Re-opened'];

export default function BugFilters({ filters, onChange }) {
  return (
    <div className="bts-filter-bar">
      <div className="bts-filter-bar__pills">
        {STATUSES.map(s => (
          <button key={s}
            className={`bts-filter-pill${filters.status === s ? ' bts-filter-pill--active' : ''}`}
            onClick={() => onChange({ ...filters, status: s })}>
            {s}
          </button>
        ))}
      </div>
      <input className="bts-filter-bar__search" type="text"
        placeholder="Search title, description, or ID"
        value={filters.search}
        onChange={e => onChange({ ...filters, search: e.target.value })} />
    </div>
  );
}

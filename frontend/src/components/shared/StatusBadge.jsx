export default function StatusBadge({ text, type = 'status' }) {
  const statusMap = { 'open':'badge-status-open', 'in progress':'badge-status-inprogress', 'resolved':'badge-status-resolved', 'closed':'badge-status-closed', 're-opened':'badge-status-reopened' };
  const levelMap  = { low:'badge-low', medium:'badge-medium', high:'badge-high', critical:'badge-critical' };
  const cls = type === 'status'
    ? (statusMap[text?.toLowerCase()] || 'badge-status-open')
    : (levelMap[text?.toLowerCase()]  || 'badge-medium');
  return <span className={`badge ${cls}`}>{text}</span>;
}

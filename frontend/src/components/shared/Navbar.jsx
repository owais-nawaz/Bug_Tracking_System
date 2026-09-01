const ROLE_LABEL = { Tester: 'QA Tester', Developer: 'Developer', QALead: 'QA Lead' };

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="bts-navbar">
      <span className="bts-navbar__brand">
        <span className="material-icons" style={{ fontSize: 22 }}>bug_report</span>
        Bug Tracker Portal
      </span>
      <div className="bts-navbar__user">
        <span className="bts-navbar__role" style={{ fontSize: 13 }}>
          {user?.username} · {ROLE_LABEL[user?.role]}
        </span>
        <button className="btn-outline-white btn-sm" onClick={onLogout}>
          <span className="material-icons" style={{ fontSize: 16 }}>logout</span> Logout
        </button>
      </div>
    </nav>
  );
}

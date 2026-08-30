import { useEffect } from 'react';

export default function Notification({ message, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: 'check_circle', error: 'error', info: 'info' };
  return (
    <div className={`bts-notification bts-notification--${type}`} role="alert">
      <span className={`material-icons bts-notification__icon bts-notification__icon--${type}`}>{icons[type]}</span>
      <span className="bts-notification__message">{message}</span>
      <button className="bts-notification__close" onClick={onClose} aria-label="Dismiss">
        <span className="material-icons" style={{ fontSize: 18 }}>close</span>
      </button>
    </div>
  );
}

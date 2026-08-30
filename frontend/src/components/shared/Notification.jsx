import { useEffect } from 'react';

export default function Notification({ message, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  return (
    <div className={`bts-notification bts-notification--${type}`} role="alert">
      <span className="bts-notification__icon">{icons[type]}</span>
      <span className="bts-notification__message">{message}</span>
      <button className="bts-notification__close" onClick={onClose}>×</button>
    </div>
  );
}

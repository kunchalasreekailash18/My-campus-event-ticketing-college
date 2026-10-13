import React from 'react';

export default function NotificationToast({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="toast-container">
      {notifications.map((n) => (
        <div key={n.id} className={`toast ${n.type || 'info'}`} onClick={() => onDismiss(n.id)}>
          <span>{n.type === 'error' ? '❌' : '✨'}</span>
          <span>{n.message}</span>
        </div>
      ))}
    </div>
  );
}


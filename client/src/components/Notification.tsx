import React, { useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationProps {
  message: string;
  type?: NotificationType;
  onClose?: () => void;
  duration?: number; // ms
}

const typeStyles: Record<NotificationType, string> = {
  success: 'bg-green-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-blue-600 text-white',
  warning: 'bg-yellow-500 text-black',
};

const Notification: React.FC<NotificationProps> = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={`fixed z-50 bottom-6 right-6 min-w-[240px] max-w-xs px-4 py-3 rounded shadow-lg flex items-center gap-3 ${typeStyles[type]}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-lg font-bold opacity-70 hover:opacity-100 focus:outline-none"
          aria-label="Dismiss notification"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Notification;

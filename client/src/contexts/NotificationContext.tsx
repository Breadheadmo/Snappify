import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Notification, { NotificationType } from '../components/Notification';

interface NotificationState {
  message: string;
  type: NotificationType;
  visible: boolean;
}

interface NotificationContextProps {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider');
  return ctx;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>({ message: '', type: 'info', visible: false });
  const [duration, setDuration] = useState<number>(4000);

  const showNotification = useCallback((message: string, type: NotificationType = 'info', durationMs?: number) => {
    setState({ message, type, visible: true });
    setDuration(durationMs || 4000);
  }, []);

  const handleClose = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {state.visible && (
        <Notification
          message={state.message}
          type={state.type}
          onClose={handleClose}
          duration={duration}
        />
      )}
    </NotificationContext.Provider>
  );
};

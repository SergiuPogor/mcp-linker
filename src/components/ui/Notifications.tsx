import { X } from 'lucide-react';
import React from 'react';
import { Button } from "./button";

export interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'error';
  autoClose?: number;
  action?: {
    label: string;
    onClick: () => void;
    loading?: boolean; // Add this new property
  };
}

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  className?: string;
}

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onDismiss }) => {
  React.useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.autoClose) {
        const timer = setTimeout(() => {
          onDismiss(notification.id);
        }, notification.autoClose);
        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 min-w-[300px] max-w-[400px]">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            rounded-lg shadow-lg p-4 animate-slide-up
            ${notification.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : ''}
            ${notification.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' : ''}
            ${notification.type === 'info' ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-gray-900">{notification.title}</h4>
            <button
              onClick={() => onDismiss(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          {notification.message && (
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          )}
          {notification.action && (
            <Button
              onClick={notification.action.onClick}
              className="mt-2 text-sm hover:bg-gray-800 font-medium"
              disabled={notification.action.loading}
            >
              {notification.action.loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  {notification.action.label}
                </div>
              ) : (
                notification.action.label
              )}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
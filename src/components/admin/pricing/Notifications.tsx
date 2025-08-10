import React from 'react';
import { NotificationState } from './types';

interface NotificationsProps {
  notification: NotificationState;
}

const Notifications: React.FC<NotificationsProps> = ({ notification }) => {
  const { error, success } = notification;

  return (
    <>
      {error && (
        <div className="border-t border-gray-200 px-4 py-3 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="border-t border-gray-200 px-4 py-3 bg-green-50 text-green-700">
          {success}
        </div>
      )}
    </>
  );
};

export default Notifications;
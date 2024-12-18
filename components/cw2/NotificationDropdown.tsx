import React from 'react'
import { format } from 'date-fns'

interface Notification {
  _id: string;
  userAddress: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onNotificationClick }) => {
  return (
    <div className="fixed top-20 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-purple-400 z-[9999]">
      <div className="max-h-96 overflow-y-auto divide-y divide-purple-200">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`p-4 cursor-pointer transition-colors ${
                notification.read ? 'bg-white/50' : 'bg-purple-50'
              } hover:bg-purple-100/50`}
              onClick={() => onNotificationClick(notification._id)}
            >
              <p className="text-sm">{notification.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
              </p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No notifications</div>
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown


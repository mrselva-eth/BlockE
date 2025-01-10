'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import { format } from 'date-fns'

interface NotificationIconProps {
  size?: number;
}

interface Notification {
  _id: string;
  userAddress: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationIcon({ size = 32 }: NotificationIconProps) {
  const { address } = useWallet()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const fetchNotifications = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/notifications?userAddress=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      const fetchedNotifications = await response.json()
      setNotifications(fetchedNotifications)
      setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.read).length)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }, [address])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleNotificationClick = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })
      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }
      await fetchNotifications()
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  return (
    <div className="relative">
      <button
        className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/95 transition-colors border-2 border-purple-400`}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell size={size * 0.75} className="text-purple-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-purple-400 z-[9999]">
          <div className="max-h-96 overflow-y-auto divide-y divide-purple-200">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 cursor-pointer transition-colors ${
                    notification.read ? 'bg-white/50' : 'bg-purple-50'
                  } hover:bg-purple-100/50`}
                  onClick={() => handleNotificationClick(notification._id)}
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
      )}
    </div>
  )
}


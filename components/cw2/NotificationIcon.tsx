'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Bell, Copy, Check } from 'lucide-react'
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
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null)
  const [newMessageSound, setNewMessageSound] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(`/api/notifications?userAddress=${address}`)
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      const fetchedNotifications = await response.json() as Notification[]
      setNotifications(fetchedNotifications)
      setUnreadCount(fetchedNotifications.filter(n => !n.read).length)

      // Check for new messages and play sound if necessary
      if (fetchedNotifications.length > 0) {
        const lastMessage = fetchedNotifications[0];
        if (!lastMessageRef.current || lastMessage._id !== lastMessageRef.current._id) {
          setNewMessageSound(true);
          lastMessageRef.current = lastMessage;
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }, [address])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [fetchNotifications])


  const handleCopy = (content: string, notificationId: string) => {
    // Extract address from content
    const addressMatch = content.match(/from (0x[a-fA-F0-9]{40})/i);
    const addressToCopy = addressMatch ? addressMatch[1] : null;

    if (addressToCopy) {
      copyToClipboard(addressToCopy);
      setCopiedNotification(notificationId)
      setTimeout(() => setCopiedNotification(null), 2000)
    } else {
      console.error('Could not extract address from notification content:', content);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 5)}...${addr.slice(-3)}`
  }

  useEffect(() => {
    if (newMessageSound && audioRef.current) {
      audioRef.current.play();
      setNewMessageSound(false);
    }
  }, [newMessageSound]);

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length === 0) return;

      await Promise.all(
        unreadNotifications.map(async (notification) => {
          await fetch(`/api/notifications`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationId: notification._id }),
          });
        })
      );

      await fetchNotifications(); // Refresh notifications after marking as read
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })
      await fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const lastMessageRef = useRef<Notification | null>(null)

  return (
    <div className="relative">
      <button
        className={`p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/95 transition-colors border-2 border-purple-400 dark:bg-gray-800 dark:border-purple-800 dark:hover:bg-gray-700`}
        onClick={() => setShowNotifications(!showNotifications)}
        onMouseDown={() => {
          setIsLongPressing(true);
          setLongPressTimer(
            setTimeout(() => {
              markAllAsRead();
              setIsLongPressing(false);
              setShowNotifications(false); // Close the dropdown after marking all as read
            }, 3000)
          );
        }}
        onMouseUp={() => {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
            setIsLongPressing(false);
          }
        }}
        onMouseLeave={() => {
          if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
            setIsLongPressing(false);
          }
        }}
      >
        <Bell size={size * 0.75} className="text-purple-600 dark:text-purple-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center dark:from-purple-400 dark:to-pink-400">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-purple-400 z-[9999] dark:bg-gray-800 dark:border-purple-800">
          <div className="max-h-96 overflow-y-auto divide-y divide-purple-200 dark:divide-purple-700">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 cursor-pointer transition-colors ${
                    notification.read ? 'bg-white/50 dark:bg-gray-700/50' : 'bg-purple-50 dark:bg-purple-700/50'
                  } hover:bg-purple-100/50 dark:hover:bg-purple-700/50`}
                  onClick={() => handleNotificationClick(notification._id)}
                >
                  <p className="text-sm dark:text-gray-300">
                    {notification.content.replace(/0x[a-fA-F0-9]{40}/gi, addr => truncateAddress(addr))} {/* Truncate addresses */}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
                    </p>
                    <button onClick={() => handleCopy(notification.content, notification._id)} className="text-xs text-purple-600 hover:text-purple-700 px-2 py-1 rounded-md hover:bg-purple-50 dark:text-purple-300 dark:hover:text-purple-400 dark:hover:bg-purple-700/50">
                      {copiedNotification === notification._id ? (
                        <Check size={18} className="text-green-500 dark:text-green-400" />
                      ) : (
                        <Copy size={18} className="dark:text-purple-300" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
            )}
          </div>
        </div>
      )}
      <audio ref={audioRef} src="/notification.mp3" preload="auto" />
    </div>
  )
}


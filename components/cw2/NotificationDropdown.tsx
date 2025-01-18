import React from 'react'
import { format } from 'date-fns'
import { Check } from 'lucide-react'

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

const copyToClipboard = (text: string) => {
 navigator.clipboard.writeText(text);
};

const truncateAddress = (addr: string) => {
 return `${addr.slice(0, 5)}...${addr.slice(-3)}`
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ notifications, onNotificationClick }) => {
 return (
   <div className="fixed top-20 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border-2 border-purple-400 z-[9999] dark:bg-gray-800 dark:border-purple-800">
     <div className="max-h-96 overflow-y-auto divide-y divide-purple-200 dark:divide-gray-700">
       {notifications.length > 0 ? (
         notifications.map((notification) => (
           <div
             key={notification._id}
             className={`p-4 cursor-pointer transition-colors flex gap-2 ${
               notification.read ? 'bg-white/50 dark:bg-gray-700/50' : 'bg-purple-50 dark:bg-purple-900/50'
             }`}
             onClick={() => onNotificationClick(notification._id)}
           >
             {notification.read && <Check size={16} className="text-green-600 dark:text-green-400" />}
             <div>
               <p className="text-sm text-gray-900 dark:text-gray-100">{notification.content.replace(/0x[a-fA-F0-9]{40}/gi, addr => truncateAddress(addr))}</p>
               <p className="text-xs text-gray-500 dark:text-gray-400">
                 {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
               </p>
             </div>
             <div className="flex items-center justify-between mt-1">

               <button onClick={() => copyToClipboard(notification.userAddress)} className="text-xs text-purple-600 hover:text-purple-700 px-2 py-1 rounded-md hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-700/50">
                 Copy
               </button>
             </div>
           </div>
         ))
       ) : (
         <div className="p-4 text-center text-gray-500 dark:text-gray-400">No notifications</div>
       )}
     </div>
   </div>
 )
}

export default NotificationDropdown


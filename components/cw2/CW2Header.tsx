import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Menu } from 'lucide-react'

interface CW2HeaderProps {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  activeMenu: 'contacts' | 'groups';
  handleMenuChange: (menu: 'contacts' | 'groups') => void;
}

export default function CW2Header({ showSidebar, setShowSidebar, activeMenu, handleMenuChange }: CW2HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex justify-between items-center p-4 border-b border-black bg-[#FAECFA] backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <Menu size={24} className="text-gray-600" />
        </button>
        
        <div className="flex bg-white/50 rounded-lg overflow-hidden">
          <button
            className={`px-4 py-2 transition-colors ${
              activeMenu === 'contacts'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'hover:bg-white/50'
            }`}
            onClick={() => handleMenuChange('contacts')}
          >
            Contacts
          </button>
          <button
            className={`px-4 py-2 transition-colors ${
              activeMenu === 'groups'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'hover:bg-white/50'
            }`}
            onClick={() => handleMenuChange('groups')}
          >
            Groups
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold">
        CW<sup>2</sup>
      </h1>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          {format(currentTime, 'MMMM d, yyyy HH:mm:ss')}
        </div>
      </div>
    </div>
  )
}


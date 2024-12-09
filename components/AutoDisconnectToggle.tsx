'use client'

import { useState } from 'react'
import { Clock } from 'lucide-react'

interface AutoDisconnectToggleProps {
  onToggle: (isEnabled: boolean) => void
  isEnabled: boolean
}

export default function AutoDisconnectToggle({ onToggle, isEnabled }: AutoDisconnectToggleProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div 
      className="fixed bottom-4 left-4 z-50"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="relative">
        <label className="cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="peer sr-only"
          />
          <div className="w-6 h-6 rounded border border-gray-200 bg-white shadow-sm flex items-center justify-center transition-colors hover:bg-gray-50 peer-checked:bg-gradient-to-r from-blue-500 to-purple-600">
            {isEnabled && (
              <Clock className="w-3 h-3 text-white" />
            )}
          </div>
        </label>
        
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            Auto-disconnect {isEnabled ? 'enabled' : 'disabled'}
          </div>
        )}
      </div>
    </div>
  )
}


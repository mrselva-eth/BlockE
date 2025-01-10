'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Clock } from 'lucide-react'
import { useWallet } from '@/contexts/WalletContext'
import AutoDisconnectAlert from './AutoDisconnectAlert'

export default function AutoDisconnectLayer() {
  const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const {
    isConnected,
    isAutoDisconnectEnabled,
    toggleAutoDisconnect,
    showDisconnectAlert,
    setShowDisconnectAlert,
    resetAutoDisconnectTimer,
    lastActivityTime,
    updateLastActivityTime
  } = useWallet()

  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    if (isConnected && isAutoDisconnectEnabled) {
      resetAutoDisconnectTimer()
    }
  }, [isConnected, isAutoDisconnectEnabled, resetAutoDisconnectTimer])

  const handleAlertClosed = useCallback(() => {
    setShowDisconnectAlert(false)
    updateLastActivityTime()
  }, [setShowDisconnectAlert, updateLastActivityTime]) // Removed resetAutoDisconnectTimer from dependencies

  if (!isConnected) {
    return null
  }

  return (
    <>
      {showDisconnectAlert && (
        <AutoDisconnectAlert
          isAutoDisconnectEnabled={isAutoDisconnectEnabled}
          onClose={handleAlertClosed} // Pass the handleAlertClosed function
        />
      )}
      <div
        className="fixed bottom-4 left-4 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md cursor-pointer"
        onClick={() => toggleAutoDisconnect(!isAutoDisconnectEnabled)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Clock size={20} className="text-gray-600 dark:text-gray-400" />
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap">
            {isAutoDisconnectEnabled ? 'Disable' : 'Enable'} auto-disconnect
          </div>
        )}
      </div>
    </>
  )
}


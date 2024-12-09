'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'

interface AutoDisconnectAlertProps {
  onDisconnect: () => void
  onResetTimer: () => void
  onToggleAutoDisconnect: (isEnabled: boolean) => void
  isAutoDisconnectEnabled: boolean
}

const AutoDisconnectAlert: React.FC<AutoDisconnectAlertProps> = ({
  onDisconnect,
  onResetTimer,
  onToggleAutoDisconnect,
  isAutoDisconnectEnabled
}) => {
  const [countdown, setCountdown] = useState(5)

  const handleDisconnect = useCallback(() => {
    if (countdown === 0 && isAutoDisconnectEnabled) {
      onDisconnect()
    }
  }, [countdown, onDisconnect, isAutoDisconnectEnabled])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isAutoDisconnectEnabled) {
      timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer)
            return 0
          }
          return prevCount - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [isAutoDisconnectEnabled])

  useEffect(() => {
    handleDisconnect()
  }, [handleDisconnect])

  useEffect(() => {
    const handleActivity = () => {
      if (countdown > 0 && isAutoDisconnectEnabled) {
        onResetTimer()
      }
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [countdown, onResetTimer, isAutoDisconnectEnabled])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 max-w-sm w-full mx-4 text-center relative">
        <AlertCircle className="mx-auto mb-3 text-yellow-500" size={36} />
        <h2 className="text-xl font-bold mb-3">Auto-disconnect Warning</h2>
        <p className="mb-4">You will be disconnected due to inactivity in:</p>
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 stroke-current"
              strokeWidth="4"
              cx="50"
              cy="50"
              r="48"
              fill="transparent"
            ></circle>
            <circle
              className="text-blue-600 stroke-current"
              strokeWidth="4"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="48"
              fill="transparent"
              strokeDasharray={302}
              strokeDashoffset={302 * ((5 - countdown) / 5)}
              style={{
                transformOrigin: 'center',
                transform: 'rotate(-90deg)',
              }}
            ></circle>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold">
            {countdown}
          </span>
        </div>
        <p className="text-sm">Move your cursor or press any key to stay connected.</p>
        <div className="absolute bottom-4 left-4 flex items-center">
          <input
            type="checkbox"
            id="disableAutoDisconnect"
            checked={!isAutoDisconnectEnabled}
            onChange={(e) => onToggleAutoDisconnect(!e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="disableAutoDisconnect" className="text-sm text-gray-600">
            Disable auto-disconnect
          </label>
        </div>
      </div>
    </div>
  )
}

export default AutoDisconnectAlert


'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AlertCircle } from 'lucide-react'

interface AutoDisconnectAlertProps {
  onDisconnect: () => void
  onResetTimer: () => void
}

const AutoDisconnectAlert: React.FC<AutoDisconnectAlertProps> = ({ onDisconnect, onResetTimer }) => {
  const [countdown, setCountdown] = useState(60)

  const handleDisconnect = useCallback(() => {
    if (countdown === 0) {
      onDisconnect()
    }
  }, [countdown, onDisconnect])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(timer)
          return 0
        }
        return prevCount - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    handleDisconnect()
  }, [handleDisconnect])

  useEffect(() => {
    const handleActivity = () => {
      if (countdown > 0) {
        onResetTimer()
      }
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [countdown, onResetTimer])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 text-center">
        <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
        <h2 className="text-2xl font-bold mb-4">Auto-disconnect Warning</h2>
        <p className="mb-6">You will be disconnected due to inactivity in:</p>
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200 stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
            ></circle>
            <circle
              className="text-blue-600 stroke-current"
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              strokeDasharray={283}
              strokeDashoffset={283 * countdown / 60}
              style={{ 
                animation: 'rotateCircle 2s linear infinite',
                transformOrigin: '50% 50%'
              }}
            ></circle>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
            {countdown}
          </span>
        </div>
        <p>Move your cursor or press any key to stay connected.</p>
      </div>
    </div>
  )
}

export default AutoDisconnectAlert


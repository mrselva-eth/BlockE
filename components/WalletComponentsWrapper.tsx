'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import { useRouter } from 'next/navigation'
import AnimationWrapper from './AnimationWrapper'
import AutoDisconnectAlert from './AutoDisconnectAlert'
import AutoDisconnectToggle from './AutoDisconnectToggle'

export default function WalletComponentsWrapper() {
  const { disconnectWallet, isConnected } = useWallet()
  const router = useRouter()
  const [showDisconnectAlert, setShowDisconnectAlert] = useState(false)
  const [lastActiveTime, setLastActiveTime] = useState(Date.now())
  const [isAutoDisconnectEnabled, setIsAutoDisconnectEnabled] = useState(true)

  const handleDisconnect = useCallback(() => {
    disconnectWallet()
    setShowDisconnectAlert(false)
    router.push('/')
  }, [disconnectWallet, router])

  const resetInactivityTimer = useCallback(() => {
    setLastActiveTime(Date.now())
    setShowDisconnectAlert(false)
  }, [])

  const handleToggleAutoDisconnect = useCallback((isEnabled: boolean) => {
    setIsAutoDisconnectEnabled(isEnabled)
    if (isEnabled) {
      resetInactivityTimer()
    } else {
      setShowDisconnectAlert(false)
    }
  }, [resetInactivityTimer])

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout

    const checkInactivity = () => {
      if (!isAutoDisconnectEnabled) return

      const currentTime = Date.now()
      const inactiveTime = currentTime - lastActiveTime

      if (inactiveTime >= 295000) { // 4 minutes and 55 seconds
        setShowDisconnectAlert(true)
      }

      if (inactiveTime >= 300000) { // 5 minutes
        handleDisconnect()
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkInactivity()
      }
    }

    const handleWakeUp = () => {
      checkInactivity()
    }

    if (isConnected && isAutoDisconnectEnabled) {
      inactivityTimer = setInterval(checkInactivity, 1000) // Check every second
      document.addEventListener('visibilitychange', handleVisibilityChange)
      window.addEventListener('focus', handleWakeUp)
    }

    return () => {
      if (inactivityTimer) clearInterval(inactivityTimer)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleWakeUp)
    }
  }, [isConnected, lastActiveTime, handleDisconnect, isAutoDisconnectEnabled])

  useEffect(() => {
    const handleActivity = () => {
      resetInactivityTimer()
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('scroll', handleActivity)
    window.addEventListener('click', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('click', handleActivity)
    }
  }, [resetInactivityTimer])

  return (
    <>
      <AnimationWrapper />
      {showDisconnectAlert && (
        <AutoDisconnectAlert 
          onDisconnect={handleDisconnect} 
          onResetTimer={resetInactivityTimer}
          onToggleAutoDisconnect={handleToggleAutoDisconnect}
          isAutoDisconnectEnabled={isAutoDisconnectEnabled}
        />
      )}
      {isConnected && (
        <AutoDisconnectToggle
          onToggle={handleToggleAutoDisconnect}
          isEnabled={isAutoDisconnectEnabled}
        />
      )}
    </>
  )
}


'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import AnimationWrapper from './AnimationWrapper'
import AutoDisconnectAlert from './AutoDisconnectAlert'

export default function WalletComponentsWrapper() {
  const { disconnectWallet, isConnected } = useWallet()
  const [showDisconnectAlert, setShowDisconnectAlert] = useState(false)

  const handleDisconnect = useCallback(() => {
    disconnectWallet()
    setShowDisconnectAlert(false)
  }, [disconnectWallet])

  const resetInactivityTimer = useCallback(() => {
    setShowDisconnectAlert(false)
  }, [])

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout

    const startInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer)
      if (isConnected) {
        inactivityTimer = setTimeout(() => {
          setShowDisconnectAlert(true)
        }, 295000) // 4 minutes and 55 seconds of inactivity
      }
    }

    if (isConnected) {
      startInactivityTimer()
    } else {
      setShowDisconnectAlert(false)
    }

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer)
    }
  }, [isConnected])

  return (
    <>
      <AnimationWrapper />
      {showDisconnectAlert && (
        <AutoDisconnectAlert 
          onDisconnect={handleDisconnect} 
          onResetTimer={resetInactivityTimer}
        />
      )}
    </>
  )
}


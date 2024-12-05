'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext'
import NetworkWarningModal from './NetworkWarningModal'
import AnimationWrapper from './AnimationWrapper'
import AutoDisconnectAlert from './AutoDisconnectAlert'

export default function WalletComponentsWrapper() {
  const { disconnectWallet, isConnected } = useWallet()
  const [showDisconnectAlert, setShowDisconnectAlert] = useState(false)

  const handleDisconnect = useCallback(() => {
    disconnectWallet()
    setShowDisconnectAlert(false)
  }, [disconnectWallet])

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer)
      if (isConnected) {
        inactivityTimer = setTimeout(() => {
          setShowDisconnectAlert(true)
        }, 55000) // 55 seconds of inactivity
      }
    }

    const handleActivity = () => {
      setShowDisconnectAlert(false)
      resetInactivityTimer()
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)

    resetInactivityTimer()

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [isConnected])

  return (
    <>
      <NetworkWarningModal />
      <AnimationWrapper />
      {showDisconnectAlert && (
        <AutoDisconnectAlert onCountdownComplete={handleDisconnect} />
      )}
    </>
  )
}


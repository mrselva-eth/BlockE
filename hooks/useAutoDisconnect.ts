import { useState, useEffect, useCallback } from 'react'
import { useWallet } from '@/contexts/WalletContext' // Import useWallet

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export function useAutoDisconnect(isConnected: boolean) {
  const { disconnectWallet, setShowDisconnectAlert } = useWallet() // Access disconnectWallet and setShowDisconnectAlert
  const [isAutoDisconnectEnabled, setIsAutoDisconnectEnabled] = useState(true)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const resetTimer = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  const toggleAutoDisconnect = useCallback((newValue: boolean) => {
    setIsAutoDisconnectEnabled(newValue)
    localStorage.setItem('autoDisconnectEnabled', newValue.toString())
  }, [])

  const startTimer = useCallback((callback: () => void) => {
    return setTimeout(() => {
      const now = Date.now()
      if (now - lastActivity >= INACTIVITY_TIMEOUT) {
        callback()
      }
    }, INACTIVITY_TIMEOUT - (Date.now() - lastActivity)) // Subtract elapsed time
  }, [lastActivity])

  useEffect(() => {
    const savedPreference = localStorage.getItem('autoDisconnectEnabled')
    if (savedPreference !== null) {
      setIsAutoDisconnectEnabled(JSON.parse(savedPreference)) // Parse the boolean value
    }
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isConnected && isAutoDisconnectEnabled) {
      timer = startTimer(() => {
        setShowDisconnectAlert(true) // Show the alert directly
      })
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isConnected, isAutoDisconnectEnabled, startTimer, setShowDisconnectAlert, lastActivity]) // Add lastActivity to dependencies

  return {
    isAutoDisconnectEnabled,
    toggleAutoDisconnect,
    resetTimer,
    startTimer
  }
}


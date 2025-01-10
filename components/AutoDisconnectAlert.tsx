import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'

interface AutoDisconnectAlertProps {
  isAutoDisconnectEnabled: boolean;
  onClose: () => void; // Add onClose prop
}

const AutoDisconnectAlert: React.FC<AutoDisconnectAlertProps> = ({ isAutoDisconnectEnabled, onClose }) => { // Add onClose parameter
  const [countdown, setCountdown] = useState(5)
  const { disconnectWallet, setShowDisconnectAlert } = useWallet()

  const handleDisconnect = useCallback(() => {
    disconnectWallet()
    setShowDisconnectAlert(false)
    onClose(); // Call onClose when disconnecting
  }, [disconnectWallet, setShowDisconnectAlert, onClose])

  const handleCancel = useCallback(() => {
    setShowDisconnectAlert(false)
    onClose(); // Call onClose when cancelling
  }, [setShowDisconnectAlert, onClose])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      handleDisconnect()
    }
  }, [countdown, handleDisconnect])

  useEffect(() => {
    const handleActivity = () => {
      if (countdown > 0) {
        setShowDisconnectAlert(false); // Reset timer by closing the alert
        onClose(); // Call onClose when activity is detected
      }
    }

    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
    }
  }, [countdown, setShowDisconnectAlert, onClose, disconnectWallet]) // Add disconnectWallet to the dependency array

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-1"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-8 max-w-md w-full relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Auto-disconnect Warning
              </h2>
              
              <p className="text-center text-gray-600 mb-6">
                {isAutoDisconnectEnabled
                  ? "You will be disconnected due to inactivity in:"
                  : "For security reasons, you will be disconnected in:"}
              </p>
              
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {countdown}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-gray-500">
                Move your cursor or press any key to stay connected
              </p>
            </div>

            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
            />

            <div className="absolute inset-0 z-0 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-purple-100 opacity-20" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-pink-100 opacity-20" />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AutoDisconnectAlert


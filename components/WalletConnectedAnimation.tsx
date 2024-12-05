'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@/contexts/WalletContext'

interface Props {
  onAnimationComplete: () => void
}

const CEO_ADDRESS = '0x603fbF99674B8ed3305Eb6EA5f3491F634A402A6'
const CEO_ENS = 'mrselva.eth'

export default function WalletConnectedAnimation({ onAnimationComplete }: Props) {
  const [show, setShow] = useState(true)
  const { address } = useWallet()
  const isCEO = address?.toLowerCase() === CEO_ADDRESS.toLowerCase()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onAnimationComplete()
    }, 1500)

    return () => clearTimeout(timer)
  }, [onAnimationComplete])

  if (!show) return null

  return (
    <div className="absolute inset-x-0 top-16 bottom-0 z-40 flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-600 to-cyan-500">
      <div className="flex flex-col items-center space-y-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 20 }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle 
              cx="50" 
              cy="50" 
              r="48" 
              stroke="white" 
              strokeWidth="2"
              className="opacity-90"
            />
            <motion.path
              d="M30 50L45 65L70 40"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center space-y-3"
        >
          {isCEO ? (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="text-3xl font-bold text-white tracking-wide"
              >
                Welcome, Commander-in-Chief!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="text-xl text-white/90"
              >
                {CEO_ENS}, your blockchain empire awaits.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className="text-lg font-semibold mt-2 text-yellow-300"
              >
                🌟 Executive Access Granted 🌟
              </motion.div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold text-white tracking-wide">
                Wallet Connected!
              </h2>
              <p className="text-xl text-white/80">
                Welcome to BlockE
              </p>
            </>
          )}
        </motion.div>
      </div>

      <motion.div 
        className="absolute bottom-4 right-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </motion.div>
    </div>
  )
}


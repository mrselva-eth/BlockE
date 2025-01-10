'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Props {
  onAnimationComplete: () => void
}

export default function WalletDisconnectedAnimation({ onAnimationComplete }: Props) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!show) {
      const unmountTimer = setTimeout(() => {
        onAnimationComplete()
      }, 500)

      return () => clearTimeout(unmountTimer)
    }
  }, [show, onAnimationComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border-2 border-purple-200 max-w-md w-full mx-4"
          >
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 relative mb-6">
                <Image
                  src="/disconnected.gif"
                  alt="Disconnection"
                  fill
                  className="object-contain"
                />
              </div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent text-center"
              >
                Wallet Successfully Disconnected
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 text-center"
              >
                Thank you for using BlockE. See you soon!
              </motion.p>
            </div>

            {/* Decorative elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden rounded-2xl">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full opacity-20 blur-xl" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


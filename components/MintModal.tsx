'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface MintModalProps {
  isOpen: boolean
  onClose: () => void
  onMint: () => Promise<void>
  isMinting: boolean
  isSuccess: boolean
  needsPayment: boolean
  onSwitch?: () => Promise<void>  
  targetNetwork?: string  
}

export default function MintModal({ 
  isOpen, 
  onClose, 
  onMint, 
  isMinting, 
  isSuccess,
  needsPayment,
  onSwitch,
  targetNetwork
}: MintModalProps) {
  const [showClose, setShowClose] = useState(false)

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setShowClose(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">BlockE (BE)</h2>
          
          <div className="mb-6 text-left space-y-2">
            <p className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Governance rights in BlockE ecosystem
            </p>
            <p className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Access to premium features
            </p>
            <p className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Staking rewards
            </p>
            <p className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Community membership benefits
            </p>
            <p className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
              Future airdrops eligibility
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center">
              <div className="mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg className="w-16 h-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl font-semibold mt-2"
                >
                  Mint Successful!
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-gray-600 mt-1"
                >
                  Congratulations! You've received 1000 BE tokens.
                </motion.p>
              </div>
              {showClose && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="btn-23"
                  onClick={onClose}
                >
                  <span className="text">Close</span>
                </motion.button>
              )}
            </div>
          ) : (
            <>
              {targetNetwork ? (
                <button
                  onClick={onSwitch}
                  className="btn-23 w-full mb-4"
                >
                  <span>Switch to {targetNetwork}</span>
                </button>
              ) : (
                <button
                  onClick={onMint}
                  disabled={isMinting}
                  className="btn-23 w-full"
                >
                  <span>
                    {isMinting ? 'Minting BE...' : needsPayment ? 'Mint BE (10 MATIC)' : 'Mint BE'}
                  </span>
                </button>
              )}
              <p className="text-sm text-gray-600">
                You don&apos;t own any BEUIDs yet.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'

interface Props {
  onAnimationComplete: () => void
}

export default function WalletConnectedAnimation({ onAnimationComplete }: Props) {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
      onAnimationComplete()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onAnimationComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="text-center">
        <div className="inline-block mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white animate-pulse" />
            <CheckCircle size={64} className="text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-white mb-4">Wallet Connected!</h2>
        <p className="text-xl text-blue-100">Welcome to BlockE</p>
        <div className="mt-12">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float-up 2s ease-in-out ${Math.random() * 2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


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
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-white bg-opacity-90">
      <div className="text-center">
        <div className="inline-block animate-bounce">
          <CheckCircle size={64} className="text-green-500 mb-4" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Wallet Connected Successfully!</h2>
        <p className="text-xl text-gray-600">Welcome to BlockE</p>
        <div className="mt-8">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-blue-500 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `confetti 1s ease-out ${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}


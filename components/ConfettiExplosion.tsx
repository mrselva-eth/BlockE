'use client'

import Confetti from 'react-confetti'
import { useState, useEffect } from 'react'

export default function ConfettiExplosion() {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(false)
    }, 5000) // Show confetti for 5 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!showConfetti) {
    return null
  }

  return (
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={200}
      recycle={false} // Confetti pieces disappear after falling
      colors={['#4F46E5', '#7C3AED', '#9333EA', '#A78BFA', '#C084FC', '#D6BCFA', '#E9D5FF', '#F3E8FF']} // BlockE color palette
    />
  )
}


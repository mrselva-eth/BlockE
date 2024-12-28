'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  left: string
  top: string
  width: string
  height: string
  animationDuration: string
  animationDelay: string
}

const FloatingParticles = () => {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles = [...Array(50)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      width: `${Math.random() * 20 + 10}px`,
      height: `${Math.random() * 20 + 10}px`,
      animationDuration: `${Math.random() * 3 + 2}s`,
      animationDelay: `${Math.random() * 2}s`,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <motion.div 
      className="absolute inset-0 z-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.1 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-float-up"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.width,
            height: particle.height,
            animationDuration: particle.animationDuration,
            animationDelay: particle.animationDelay,
          }}
        />
      ))}
    </motion.div>
  )
}

export default FloatingParticles


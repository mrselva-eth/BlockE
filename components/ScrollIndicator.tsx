'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Mouse } from 'lucide-react'
import { useState, useEffect } from 'react'

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const windowHeight = window.innerHeight
      setIsVisible(scrollPosition < windowHeight)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <motion.div 
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-2 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      {/* Mouse icon with scrolling animation */}
      <motion.div 
        className="relative w-6 h-10 border-2 border-gray-400 rounded-full p-1"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
      >
        <motion.div 
          className="w-1.5 h-1.5 bg-gray-400 rounded-full mx-auto"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Animated chevrons */}
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ y: [0, 5, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={20} className="text-gray-400" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 5, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        >
          <ChevronDown size={20} className="text-gray-400 -mt-2" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 5, 0], opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <ChevronDown size={20} className="text-gray-400 -mt-2" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ScrollIndicator


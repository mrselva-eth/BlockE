"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"
import { usePathname } from "next/navigation"

const AnnouncementAlert = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [isClosed, setIsClosed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (pathname === "/") {
      timer = setTimeout(() => {
        setIsVisible(false)

        const interval = setInterval(() => {
          if (!isClosed) {
            // Only show if not manually closed
            setIsVisible(true)
            setTimeout(() => setIsVisible(false), 5000) // Hide after 5 seconds
          }
        }, 30000) // Show every 30 seconds

        return () => clearInterval(interval)
      }, 5000) // Initial hide after 5 seconds
    }

    return () => clearTimeout(timer)
  }, [pathname, isClosed]) // Add isClosed to dependencies

  if (pathname !== "/" || !isVisible || isClosed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className="fixed top-28 left-4 z-50 w-80 bg-gradient-to-r from-blockchain-blue to-blockchain-purple p-4 rounded-lg shadow-md text-white"
      >
        <div className="flex items-center justify-between">
          {/* Close button */}
          <button
            onClick={() => setIsClosed(true)} // Set isClosed to true on click
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close Announcement"
          >
            <X size={16} className="text-white" />
          </button>

          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold mb-2">BE Drop Announcement</h3>
            <p className="text-sm">
              Participate in our BE Drop program and earn free BE tokens. Complete tasks and unlock rewards.
            </p>
          </div>
          <Link href="/be-drop">
            <div className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AnnouncementAlert


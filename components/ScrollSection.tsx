'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface ScrollSectionProps {
  children: React.ReactNode
  className?: string
}

const ScrollSection = ({ children, className = '' }: ScrollSectionProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    margin: "-100px 0px -100px 0px",
    once: false
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 100 }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 100
      }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default ScrollSection


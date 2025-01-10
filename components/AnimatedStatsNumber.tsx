'use client'

import { useState, useEffect } from 'react'

interface AnimatedStatsNumberProps {
  value: string
  decimals?: number
}

export default function AnimatedStatsNumber({ value, decimals = 6 }: AnimatedStatsNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const targetValue = parseFloat(value)
    const duration = 2000 // 2 seconds
    const steps = 60
    const stepDuration = duration / steps
    const increment = targetValue / steps
    let currentStep = 0
    
    const timer = setInterval(() => {
      currentStep++
      if (currentStep === steps) {
        setDisplayValue(targetValue)
        clearInterval(timer)
      } else {
        setDisplayValue((prevValue) => Math.min(prevValue + increment, targetValue))
      }
    }, stepDuration)
    
    return () => clearInterval(timer)
  }, [value])
  
  return (
    <span>{displayValue.toFixed(decimals)}</span>
  )
}


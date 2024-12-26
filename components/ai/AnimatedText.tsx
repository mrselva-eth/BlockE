import React, { useState, useEffect } from 'react'

interface AnimatedTextProps {
  text: string;
  speed?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i))
        i++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span className="animated-text">
      {displayedText}
      {displayedText.length < text.length && <span className="cursor">|</span>}
    </span>
  )
}

export default AnimatedText


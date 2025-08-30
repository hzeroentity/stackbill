'use client'

import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
  formatValue?: (value: number) => string
}

export function AnimatedCounter({ 
  value, 
  duration = 1000, 
  className = '', 
  formatValue 
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const startTime = Date.now()
    const startValue = displayValue
    const difference = Math.abs(value - startValue)
    
    // Adaptive duration based on value range
    let adaptiveDuration = duration
    if (difference <= 5) {
      // For small numbers (0-5), use very short duration
      adaptiveDuration = Math.max(200, duration * 0.3)
    } else if (difference <= 20) {
      // For medium small numbers (6-20), use shorter duration
      adaptiveDuration = Math.max(300, duration * 0.5)
    } else if (difference <= 100) {
      // For medium numbers (21-100), use normal duration
      adaptiveDuration = duration * 0.8
    }
    // For large numbers (100+), use full duration

    const animateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / adaptiveDuration, 1)
      
      // Use easeOutCubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      
      const currentValue = startValue + (difference * easeOutCubic)
      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animateValue)
      } else {
        setDisplayValue(value)
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animateValue)
  }, [value, duration, displayValue])

  const formattedValue = formatValue ? formatValue(displayValue) : Math.floor(displayValue).toString()

  return (
    <span 
      className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}
    >
      {formattedValue}
    </span>
  )
}
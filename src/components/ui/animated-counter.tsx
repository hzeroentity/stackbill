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
    
    // Adaptive duration based on value range - more granular timing
    let adaptiveDuration = duration
    if (difference <= 1) {
      // For tiny numbers (0-1), almost instant
      adaptiveDuration = 150
    } else if (difference <= 3) {
      // For very small numbers (2-3), very quick
      adaptiveDuration = 200
    } else if (difference <= 10) {
      // For small numbers (4-10), quick
      adaptiveDuration = Math.max(250, duration * 0.4)
    } else if (difference <= 30) {
      // For medium small numbers (11-30), medium quick
      adaptiveDuration = Math.max(350, duration * 0.6)
    } else if (difference <= 100) {
      // For medium numbers (31-100), normal duration
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  const formattedValue = formatValue ? formatValue(displayValue) : Math.floor(displayValue).toString()

  return (
    <span 
      className={`${className} ${isAnimating ? 'animate-pulse' : ''}`}
    >
      {formattedValue}
    </span>
  )
}
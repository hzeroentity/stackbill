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
    const difference = value - startValue

    const animateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
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
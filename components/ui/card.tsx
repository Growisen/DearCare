"use client"
import * as React from "react"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`
        rounded-2xl bg-gradient-to-br from-[#ebf4f5]/50 to-[#f7f5fa]/50
        border border-[#004d6d]/10
        transition-all duration-200 ease-in-out
        ${className}`}
      {...props}
    />
  )
)
Card.displayName = "Card"

export { Card }

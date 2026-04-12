"use client"

import { useRef, type ReactNode, type MouseEvent } from "react"
import { cn } from "@/lib/utils"

type GlowCardProps = {
  children: ReactNode
  className?: string
}

export function GlowCard({ children, className }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    cardRef.current.style.setProperty("--glow-x", `${x}px`)
    cardRef.current.style.setProperty("--glow-y", `${y}px`)
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn("relative rounded-xl overflow-hidden", className)}
    >
      <div
        className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at var(--glow-x, 50%) var(--glow-y, 50%), oklch(0.45 0 0) 0%, transparent 70%)`,
        }}
      />
      <div className="relative m-[1px] rounded-[11px] bg-card/40 h-[calc(100%-2px)]">
        {children}
      </div>
    </div>
  )
}

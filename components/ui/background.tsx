"use client"

import { useEffect, useRef } from "react"

export function Background() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.left = `${e.clientX}px`
        spotlightRef.current.style.top = `${e.clientY}px`
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none dot-grid opacity-30" />
      <div className="fixed top-0 left-0 right-0 h-[700px] z-0 pointer-events-none hero-glow" />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, var(--background) 100%)",
        }}
      />
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.025] mix-blend-overlay noise-texture" />
      <div
        ref={spotlightRef}
        className="fixed z-0 pointer-events-none -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.04] transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, currentColor 0%, transparent 70%)",
        }}
      />
    </>
  )
}

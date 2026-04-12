"use client"

import { useEffect, useRef } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      remove: (id: string) => void
      reset: (id: string) => void
    }
  }
}

type TurnstileProps = {
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
}

export function Turnstile({ siteKey, onVerify, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | undefined>(undefined)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)
  onVerifyRef.current = onVerify
  onExpireRef.current = onExpire

  useEffect(() => {
    let cancelled = false
    let intervalId: ReturnType<typeof setInterval> | undefined

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return
      if (widgetId.current !== undefined) return // already mounted
      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onExpireRef.current?.(),
      })
    }

    if (window.turnstile) {
      render()
    } else if (!document.querySelector("#cf-turnstile-script")) {
      const script = document.createElement("script")
      script.id = "cf-turnstile-script"
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
      script.async = true
      script.defer = true
      script.onload = render
      document.head.appendChild(script)
    } else {
      intervalId = setInterval(() => {
        if (window.turnstile) {
          clearInterval(intervalId)
          render()
        }
      }, 100)
    }

    return () => {
      cancelled = true
      clearInterval(intervalId)
      if (widgetId.current !== undefined && window.turnstile) {
        window.turnstile.remove(widgetId.current)
        widgetId.current = undefined
      }
    }
  }, [siteKey])

  return <div ref={containerRef} />
}

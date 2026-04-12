"use client"

import { useModal } from "./modal-context"

export function OpenModalButton() {
  const { openModal } = useModal()
  return (
    <button
      onClick={openModal}
      className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity"
    >
      Submit a project
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </button>
  )
}

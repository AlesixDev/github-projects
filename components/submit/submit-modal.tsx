"use client"

import { useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useModal } from "./modal-context"
import { SubmitForm } from "./submit-form"

export function SubmitModal() {
  const { open, closeModal } = useModal()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, closeModal])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "oklch(0 0 0 / 0.7)" }}
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
          aria-label="Submit a project"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl shadow-black/40"
          >
            <div className="flex items-start justify-between p-6 pb-0">
              <div>
                <h2 className="text-lg font-medium text-foreground">Submit a project</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Submissions are opened as GitHub Pull Requests. Approved PRs are merged and deployed automatically.
                </p>
              </div>
              <button
                onClick={closeModal}
                aria-label="Close modal"
                className="ml-4 flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1 -mt-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <SubmitForm />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

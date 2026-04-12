"use client"

import { useState } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import { useModal } from "@/components/submit/modal-context"

export function Nav() {
  const [visible, setVisible] = useState(false)
  const { scrollY } = useScroll()
  const { openModal } = useModal()

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100)
  })

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40">
        <AnimatePresence>
          {!visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto px-8 sm:px-12 py-6 flex items-center justify-between"
            >
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                <Image src="/favicon.png" alt="" width={20} height={20} className="rounded-sm" />
                Alex Za.
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/projects"
                  className="text-xs text-muted-foreground font-mono tracking-wider uppercase hover:text-foreground transition-colors"
                >
                  Explore
                </Link>
                <button
                  onClick={openModal}
                  className="text-xs text-muted-foreground font-mono tracking-wider uppercase hover:text-foreground transition-colors"
                >
                  Submit
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 nav-blur bg-background/60 border border-border/50 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg shadow-black/20"
          >
            <Link
              href="/"
              className="flex items-center gap-2 text-[13px] font-medium text-foreground hover:text-muted-foreground transition-colors"
            >
              <Image src="/favicon.png" alt="" width={18} height={18} className="rounded-sm" />
              Alex Za.
            </Link>
            <div className="w-px h-4 bg-border/50" />
            <Link
              href="/projects"
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Explore
            </Link>
            <div className="w-px h-4 bg-border/50" />
            <button
              onClick={openModal}
              className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Submit
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

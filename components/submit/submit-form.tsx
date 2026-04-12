"use client"

import { useActionState, useState } from "react"
import { submitProject } from "@/app/actions/submit"
import { Turnstile } from "./turnstile"
import Link from "next/link"

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""

const inputClass =
  "w-full px-4 py-2.5 bg-card/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}{" "}
        {required ? (
          <span className="text-muted-foreground">*</span>
        ) : (
          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function SubmitForm() {
  const [state, action, pending] = useActionState(submitProject, null)
  const [cfToken, setCfToken] = useState("")

  if (state?.success) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/40 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-foreground">Submission received!</h2>
        <p className="text-sm text-muted-foreground">
          A Pull Request has been opened for review. Stars, language and avatar were auto-populated from GitHub. Once merged, the project will appear automatically.
        </p>
        {state.prUrl && (
          <Link
            href={state.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            View Pull Request on GitHub
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        )}
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg border border-border/50 bg-card/40 px-4 py-3 text-sm text-muted-foreground" role="alert">
          {state.error}
        </div>
      )}

      <Field label="Project name" required>
        <input name="name" type="text" required placeholder="e.g. shadcn/ui" className={inputClass} />
      </Field>

      <Field label="Description" required>
        <textarea
          name="description"
          required
          rows={3}
          placeholder="What does this project do? What problem does it solve?"
          className={`${inputClass} resize-none`}
        />
      </Field>

      <Field label="GitHub URL" required hint="Stars, language and avatar are fetched automatically.">
        <input name="github_url" type="url" required placeholder="https://github.com/owner/repo" className={inputClass} />
      </Field>

      <Field label="Demo URL">
        <input name="demo_url" type="url" placeholder="https://yourproject.dev" className={inputClass} />
      </Field>

      <Field label="Tags" hint="Comma-separated">
        <input name="tags" type="text" placeholder="e.g. typescript, ui, api" className={inputClass} />
      </Field>

      {SITE_KEY && <Turnstile siteKey={SITE_KEY} onVerify={setCfToken} onExpire={() => setCfToken("")} />}
      <input type="hidden" name="cf-turnstile-response" value={cfToken} />

      <button
        type="submit"
        disabled={pending || (!!SITE_KEY && !cfToken)}
        className="w-full py-2.5 px-5 text-sm font-medium bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pending ? "Submitting…" : "Submit project"}
      </button>
    </form>
  )
}

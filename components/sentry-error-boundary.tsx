"use client"

import type { ReactNode } from "react"
import { ErrorBoundary } from "@sentry/react"

interface SentryErrorBoundaryProps {
  children: ReactNode
  name?: string
  fallback?: ReactNode
}

const defaultStyles = "rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"

export function SentryErrorBoundary({ children, name, fallback }: SentryErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        fallback ?? (
          <div className={defaultStyles}>
            Something went wrong while loading {name ?? "this section"}. The team has been notified.
          </div>
        )
      }
      showDialog={false}
      beforeCapture={(scope) => {
        if (name) {
          scope.setTag("errorBoundary", name)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

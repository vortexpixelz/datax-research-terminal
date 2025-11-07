"use client"

import { TickerPrice } from "@/components/notes/shortcodes/ticker-price"
import { extractShortcodes, isValidShortcode } from "@/lib/notes/shortcode-parser"
import { ReactNode } from "react"

interface NoteRendererProps {
  content: string
}

/**
 * Renders note content with embedded shortcodes for live data
 */
export function NoteRenderer({ content }: NoteRendererProps) {
  const shortcodes = extractShortcodes(content)

  if (shortcodes.length === 0) {
    // No shortcodes, render as plain text
    return <div className="prose dark:prose-invert max-w-none">{content}</div>
  }

  // Sort shortcodes by position (reverse order to maintain indices)
  const sortedShortcodes = shortcodes.sort((a, b) => b.start - a.start)

  // Build parts array with text and components
  const parts: ReactNode[] = []
  let lastEnd = content.length

  for (const shortcode of sortedShortcodes) {
    if (!isValidShortcode(shortcode)) {
      continue
    }

    // Add text after this shortcode
    if (lastEnd > shortcode.end) {
      parts.unshift(content.substring(shortcode.end, lastEnd))
    }

    // Add rendered shortcode
    const renderedShortcode = renderShortcode(shortcode)
    parts.unshift(renderedShortcode)

    lastEnd = shortcode.start
  }

  // Add remaining text before first shortcode
  if (lastEnd > 0) {
    parts.unshift(content.substring(0, lastEnd))
  }

  return (
    <div className="prose dark:prose-invert max-w-none space-y-2">
      {parts.map((part, idx) => (
        <div key={idx}>
          {typeof part === "string" ? (
            <p className="whitespace-pre-wrap">{part}</p>
          ) : (
            part
          )}
        </div>
      ))}
    </div>
  )
}

/**
 * Render individual shortcode based on type
 */
function renderShortcode(shortcode: any) {
  switch (shortcode.type) {
    case "price":
      return (
        <div key={shortcode.raw} className="my-2">
          <TickerPrice symbol={shortcode.symbol} />
        </div>
      )

    case "change":
      return (
        <div key={shortcode.raw} className="my-2">
          <TickerChange symbol={shortcode.symbol} />
        </div>
      )

    case "metrics":
      return (
        <div key={shortcode.raw} className="my-2">
          <TickerMetrics symbol={shortcode.symbol} />
        </div>
      )

    case "chart":
      return (
        <div key={shortcode.raw} className="my-2">
          <TickerChart symbol={shortcode.symbol} timeframe={shortcode.timeframe} />
        </div>
      )

    case "technical":
      return (
        <div key={shortcode.raw} className="my-2">
          <TickerTechnical symbol={shortcode.symbol} timeframe={shortcode.timeframe} />
        </div>
      )

    default:
      return <div key={shortcode.raw}>{shortcode.raw}</div>
  }
}

// Placeholder components for other shortcode types
function TickerChange({ symbol }: { symbol: string }) {
  return (
    <div className="text-sm text-gray-500 italic">
      [{symbol} change data - loading...]
    </div>
  )
}

function TickerMetrics({ symbol }: { symbol: string }) {
  return (
    <div className="text-sm text-gray-500 italic">
      [{symbol} metrics table - loading...]
    </div>
  )
}

function TickerChart({ symbol, timeframe }: { symbol: string; timeframe?: string }) {
  return (
    <div className="text-sm text-gray-500 italic">
      [{symbol} {timeframe || "1D"} chart - loading...]
    </div>
  )
}

function TickerTechnical({ symbol, timeframe }: { symbol: string; timeframe?: string }) {
  return (
    <div className="text-sm text-gray-500 italic">
      [{symbol} {timeframe || "1D"} technical analysis - loading...]
    </div>
  )
}

/**
 * Note Shortcode Parser
 * Parses and extracts shortcodes from note content for rendering live data
 *
 * Syntax:
 * {{AAPL}} - Current price
 * {{AAPL chart 1M}} - 1-month chart
 * {{AAPL metrics}} - Key metrics table
 * {{AAPL change}} - Price change
 */

export interface Shortcode {
  type: "price" | "chart" | "metrics" | "change" | "technical"
  symbol: string
  timeframe?: "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "YTD" | "ALL"
  indicatorType?: "rsi" | "macd" | "bb" | "ma"
  start: number
  end: number
  raw: string
}

/**
 * Extract all shortcodes from note content
 * Supports {{SYMBOL}} and {{SYMBOL action timeframe}} syntax
 */
export function extractShortcodes(content: string): Shortcode[] {
  const shortcodes: Shortcode[] = []

  // Pattern: {{SYMBOL}} or {{SYMBOL action}} or {{SYMBOL action timeframe}}
  const shortcodeRegex = /\{\{(\w+)(?:\s+(chart|metrics|change|technical|price))?\s*(1D|5D|1M|3M|6M|1Y|YTD|ALL)?\}\}/gi

  let match
  while ((match = shortcodeRegex.exec(content)) !== null) {
    const symbol = match[1].toUpperCase()
    const action = match[2]?.toLowerCase()
    const timeframe = match[3]?.toUpperCase() as
      | "1D"
      | "5D"
      | "1M"
      | "3M"
      | "6M"
      | "1Y"
      | "YTD"
      | "ALL"
      | undefined

    // Determine shortcode type
    let type: Shortcode["type"] = "price" // Default

    if (action === "chart") {
      type = "chart"
    } else if (action === "metrics") {
      type = "metrics"
    } else if (action === "change") {
      type = "change"
    } else if (action === "technical") {
      type = "technical"
    }

    shortcodes.push({
      type,
      symbol,
      timeframe: timeframe || "1D",
      start: match.index,
      end: match.index + match[0].length,
      raw: match[0],
    })
  }

  return shortcodes
}

/**
 * Validate shortcode syntax
 */
export function isValidShortcode(shortcode: Shortcode): boolean {
  // Symbol must be 1-5 alphanumeric characters
  if (!/^\w{1,5}$/.test(shortcode.symbol)) {
    return false
  }

  // Valid types
  const validTypes = ["price", "chart", "metrics", "change", "technical"]
  if (!validTypes.includes(shortcode.type)) {
    return false
  }

  // Valid timeframes
  const validTimeframes = [
    "1D",
    "5D",
    "1M",
    "3M",
    "6M",
    "1Y",
    "YTD",
    "ALL",
  ]
  if (shortcode.timeframe && !validTimeframes.includes(shortcode.timeframe)) {
    return false
  }

  return true
}

/**
 * Create a shortcode from components
 */
export function createShortcode(
  symbol: string,
  type: Shortcode["type"] = "price",
  timeframe?: Shortcode["timeframe"]
): string {
  const parts = [symbol.toUpperCase()]

  if (type !== "price") {
    parts.push(type)
  }

  if (timeframe && (type === "chart" || type === "technical")) {
    parts.push(timeframe)
  }

  return `{{${parts.join(" ")}}}`
}

/**
 * Replace a shortcode with new content
 */
export function replaceShortcode(
  content: string,
  shortcode: Shortcode,
  replacement: string
): string {
  return (
    content.substring(0, shortcode.start) +
    replacement +
    content.substring(shortcode.end)
  )
}

/**
 * Get all unique symbols in content
 */
export function getSymbolsFromContent(content: string): string[] {
  const shortcodes = extractShortcodes(content)
  const symbols = new Set(shortcodes.map((s) => s.symbol))
  return Array.from(symbols)
}

/**
 * Check if content references a specific symbol
 */
export function containsSymbol(content: string, symbol: string): boolean {
  const symbols = getSymbolsFromContent(content)
  return symbols.includes(symbol.toUpperCase())
}

/**
 * Extract shortcodes by type
 */
export function getShortcodesByType(
  content: string,
  type: Shortcode["type"]
): Shortcode[] {
  const shortcodes = extractShortcodes(content)
  return shortcodes.filter((s) => s.type === type)
}

/**
 * Get shortcodes for a specific symbol
 */
export function getSymbolShortcodes(content: string, symbol: string): Shortcode[] {
  const shortcodes = extractShortcodes(content)
  return shortcodes.filter((s) => s.symbol === symbol.toUpperCase())
}

/**
 * Generate a preview string for a shortcode
 */
export function generateShortcodePreview(shortcode: Shortcode): string {
  const typeLabel = shortcode.type === "price" ? "" : ` ${shortcode.type}`
  const timeframeLabel = shortcode.timeframe ? ` ${shortcode.timeframe}` : ""
  return `[${shortcode.symbol}${typeLabel}${timeframeLabel}]`
}

/**
 * List all shortcode suggestions for a symbol
 */
export function getSuggestions(symbol: string): Shortcode[] {
  const suggestions: Shortcode[] = []
  const types: Array<Shortcode["type"]> = [
    "price",
    "change",
    "chart",
    "metrics",
    "technical",
  ]
  const timeframes: Shortcode["timeframe"][] = [
    "1D",
    "5D",
    "1M",
    "3M",
    "6M",
    "1Y",
    "ALL",
  ]

  for (const type of types) {
    if (type === "price") {
      suggestions.push({
        type,
        symbol: symbol.toUpperCase(),
        start: 0,
        end: 0,
        raw: createShortcode(symbol, type),
      })
    } else if (type === "change") {
      suggestions.push({
        type,
        symbol: symbol.toUpperCase(),
        start: 0,
        end: 0,
        raw: createShortcode(symbol, type),
      })
    } else if (type === "metrics") {
      suggestions.push({
        type,
        symbol: symbol.toUpperCase(),
        start: 0,
        end: 0,
        raw: createShortcode(symbol, type),
      })
    } else if (type === "chart" || type === "technical") {
      for (const tf of timeframes) {
        suggestions.push({
          type,
          symbol: symbol.toUpperCase(),
          timeframe: tf,
          start: 0,
          end: 0,
          raw: createShortcode(symbol, type, tf),
        })
      }
    }
  }

  return suggestions
}

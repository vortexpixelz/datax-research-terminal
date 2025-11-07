/**
 * Natural Language Interpreter for Stock Screener
 * Converts natural language queries into screener filter criteria
 */

import { ScreenerCriteria } from "@/lib/types"

export interface InterpretedQuery {
  criteria: ScreenerCriteria
  confidence: number
  explanation: string
  rawTokens: string[]
}

// Pattern matching for various filter types
const MARKET_CAP_PATTERNS = [
  /large\s*cap/i,
  /mega\s*cap/i,
  /market\s*cap\s*[>≥]?\s*(\d+)\s*(billion|trillion|[bB]|[tT])?/,
  /market\s*cap\s*[<≤]?\s*(\d+)\s*(billion|trillion|[bB]|[tT])?/,
  /mid\s*cap/i,
  /small\s*cap/i,
  /micro\s*cap/i,
]

const PE_PATTERNS = [
  /p\/e\s*[<≤]?\s*(\d+(?:\.\d+)?)/i,
  /p\/e\s*[>≥]?\s*(\d+(?:\.\d+)?)/i,
  /pe\s*ratio\s*[<≤]?\s*(\d+(?:\.\d+)?)/i,
  /pe\s*ratio\s*[>≥]?\s*(\d+(?:\.\d+)?)/i,
  /expensive\s*valuation/i,
  /cheap\s*valuation/i,
  /undervalued/i,
  /overvalued/i,
]

const PRICE_PATTERNS = [
  /price\s*[<≤]?\s*\$?(\d+(?:\.\d+)?)/i,
  /price\s*[>≥]?\s*\$?(\d+(?:\.\d+)?)/i,
  /under\s*\$?(\d+)/i,
  /above?\s*\$?(\d+)/i,
]

const REVENUE_GROWTH_PATTERNS = [
  /revenue\s*growth\s*[>≥]?\s*(\d+)%?/i,
  /revenue\s*grow/i,
  /revenue\s*[<≤]?\s*(\d+)%?/i,
  /growing\s*revenue/i,
]

const EARNINGS_PATTERNS = [
  /earnings\s*growth/i,
  /eps\s*growth/i,
  /positive\s*earnings/i,
  /profitable/i,
]

const DIVIDEND_PATTERNS = [
  /dividend\s*[>≥]?\s*(\d+)%?/i,
  /dividend\s*yield\s*[>≥]?\s*(\d+)%?/i,
  /dividend\s*payer/i,
  /high\s*dividend/i,
]

const VOLUME_PATTERNS = [
  /volume\s*[>≥]?\s*(\d+)\s*(million|[mM])?/i,
  /trading\s*volume\s*[>≥]?\s*(\d+)/i,
  /liquid/i,
]

const SECTOR_PATTERNS = [
  /technology|tech/i,
  /healthcare|health|medical/i,
  /finance|financial|bank/i,
  /energy|oil|gas/i,
  /consumer|retail/i,
  /industrial/i,
  /materials|mining/i,
  /utilities/i,
  /communication|telecom/i,
  /real\s*estate|reit/i,
]

const PRICE_CHANGE_PATTERNS = [
  /up\s*(\d+)%/i,
  /down\s*(\d+)%/i,
  /gained?\s*(\d+)%/i,
  /lose?s?\s*(\d+)%/i,
  /month.*(\d+)%|(\d+)%.*month/i,
]

// Helper functions
function extractNumber(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern)
  if (!match || !match[1]) return null
  return parseFloat(match[1])
}

function extractMultiplier(text: string): number {
  if (/billion|[bB]/.test(text)) return 1e9
  if (/trillion|[tT]/.test(text)) return 1e12
  if (/million|[mM]/.test(text)) return 1e6
  return 1
}

function getSectorFromQuery(query: string): string[] {
  const sectors: { [key: string]: string } = {
    "technology|tech": "technology",
    "healthcare|health|medical": "healthcare",
    "finance|financial|bank": "financials",
    "energy|oil|gas": "energy",
    "consumer|retail": "consumer_discretionary",
    "industrial": "industrials",
    "materials|mining": "materials",
    "utilities": "utilities",
    "communication|telecom": "communication_services",
    "real estate|reit": "real_estate",
  }

  const found: string[] = []
  for (const [pattern, sector] of Object.entries(sectors)) {
    if (new RegExp(pattern, "i").test(query)) {
      found.push(sector)
    }
  }
  return found
}

/**
 * Interpret natural language query and convert to screener criteria
 */
export function interpretQuery(query: string): InterpretedQuery {
  const criteria: ScreenerCriteria = {}
  const explanation: string[] = []
  const rawTokens = query.toLowerCase().split(/\s+/)

  // Market Cap Detection
  if (/large\s*cap|mega\s*cap/i.test(query)) {
    criteria.marketCap = { min: 100e9 }
    explanation.push("Large cap (market cap > $100B)")
  } else if (/mid\s*cap/i.test(query)) {
    criteria.marketCap = { min: 2e9, max: 10e9 }
    explanation.push("Mid cap ($2B - $10B)")
  } else if (/small\s*cap/i.test(query)) {
    criteria.marketCap = { min: 300e6, max: 2e9 }
    explanation.push("Small cap ($300M - $2B)")
  } else if (/micro\s*cap/i.test(query)) {
    criteria.marketCap = { max: 300e6 }
    explanation.push("Micro cap (< $300M)")
  }

  // P/E Ratio Detection
  const peMatch = query.match(/p\/e\s*[<≤]?\s*(\d+(?:\.\d+)?)/i)
  if (peMatch && peMatch[1]) {
    const peValue = parseFloat(peMatch[1])
    criteria.pe = { max: peValue }
    explanation.push(`P/E ratio <= ${peValue}`)
  }

  const peHighMatch = query.match(/p\/e\s*[>≥]?\s*(\d+(?:\.\d+)?)/i)
  if (peHighMatch && peHighMatch[1]) {
    const peValue = parseFloat(peHighMatch[1])
    criteria.pe = { min: peValue }
    explanation.push(`P/E ratio >= ${peValue}`)
  }

  if (/cheap|undervalued|low\s*valuation/i.test(query)) {
    criteria.pe = { max: 15 }
    explanation.push("Cheap valuation (P/E < 15)")
  }

  if (/expensive|overvalued|high\s*valuation/i.test(query)) {
    criteria.pe = { min: 25 }
    explanation.push("Expensive valuation (P/E > 25)")
  }

  // Price Detection
  const priceMatch = query.match(/price\s*[<≤]?\s*\$?(\d+(?:\.\d+)?)/i)
  if (priceMatch && priceMatch[1]) {
    const price = parseFloat(priceMatch[1])
    criteria.price = { max: price }
    explanation.push(`Price <= $${price}`)
  }

  const priceHighMatch = query.match(/price\s*[>≥]?\s*\$?(\d+(?:\.\d+)?)/i)
  if (priceHighMatch && priceHighMatch[1]) {
    const price = parseFloat(priceHighMatch[1])
    criteria.price = { min: price }
    explanation.push(`Price >= $${price}`)
  }

  // Volume Detection
  const volumeMatch = query.match(/volume\s*[>≥]?\s*(\d+)\s*(million|[mM])?/i)
  if (volumeMatch && volumeMatch[1]) {
    let volume = parseInt(volumeMatch[1])
    if (volumeMatch[2]) {
      volume *= 1e6
    }
    criteria.volume = { min: volume }
    explanation.push(`Trading volume >= ${volume.toLocaleString()}`)
  }

  if (/liquid|high\s*volume/i.test(query)) {
    criteria.volume = { min: 1e6 }
    explanation.push("High liquidity (volume > 1M)")
  }

  // Revenue Growth Detection
  const revenueMatch = query.match(/revenue\s*growth\s*[>≥]?\s*(\d+)/i)
  if (revenueMatch && revenueMatch[1]) {
    const growth = parseInt(revenueMatch[1])
    explanation.push(`Revenue growth > ${growth}%`)
  }

  if (/positive\s*revenue\s*growth|growing\s*revenue/i.test(query)) {
    explanation.push("Positive revenue growth")
  }

  // Sector Detection
  const sectors = getSectorFromQuery(query)
  if (sectors.length > 0) {
    criteria.sector = sectors
    explanation.push(`Sectors: ${sectors.join(", ")}`)
  }

  // Profitability
  if (/profitable|positive\s*earnings|profitable\s*company/i.test(query)) {
    explanation.push("Profitable companies (positive earnings)")
  }

  // Price Change
  const changeMatch = query.match(/(up|gain|jump)\s*(\d+)%/i)
  if (changeMatch && changeMatch[2]) {
    const change = parseInt(changeMatch[2])
    explanation.push(`Up ${change}% recently`)
  }

  const downMatch = query.match(/(down|loss|fall)\s*(\d+)%/i)
  if (downMatch && downMatch[2]) {
    const change = parseInt(downMatch[2])
    explanation.push(`Down ${change}% recently`)
  }

  // Calculate confidence score
  let confidence = 0.5 // Base confidence
  if (Object.keys(criteria).length > 0) {
    confidence = Math.min(0.95, 0.5 + Object.keys(criteria).length * 0.15)
  }

  return {
    criteria,
    confidence,
    explanation: explanation.join(" | "),
    rawTokens,
  }
}

/**
 * Validate and refine interpreted criteria
 */
export function refineCriteria(
  criteria: ScreenerCriteria,
  refinement: string
): ScreenerCriteria {
  const refined = { ...criteria }

  // Handle price adjustments
  if (/lower|reduce/i.test(refinement)) {
    if (refined.pe?.max) {
      refined.pe.max *= 0.9 // Reduce by 10%
    }
    if (refined.price?.max) {
      refined.price.max *= 0.9
    }
  }

  if (/higher|increase/i.test(refinement)) {
    if (refined.pe?.max) {
      refined.pe.max *= 1.1 // Increase by 10%
    }
    if (refined.price?.max) {
      refined.price.max *= 1.1
    }
  }

  // Handle volume adjustments
  if (/more liquid|higher volume/i.test(refinement)) {
    if (refined.volume?.min) {
      refined.volume.min *= 2
    }
  }

  // Handle growth adjustments
  if (/slower|lower growth/i.test(refinement)) {
    // Could adjust growth criteria
  }

  return refined
}

/**
 * Generate a human-readable description of criteria
 */
export function describeCriteria(criteria: ScreenerCriteria): string {
  const parts: string[] = []

  if (criteria.marketCap?.min) {
    parts.push(`Market cap > $${(criteria.marketCap.min / 1e9).toFixed(1)}B`)
  }
  if (criteria.marketCap?.max) {
    parts.push(`Market cap < $${(criteria.marketCap.max / 1e9).toFixed(1)}B`)
  }

  if (criteria.pe?.min) {
    parts.push(`P/E > ${criteria.pe.min}`)
  }
  if (criteria.pe?.max) {
    parts.push(`P/E < ${criteria.pe.max}`)
  }

  if (criteria.price?.min) {
    parts.push(`Price > $${criteria.price.min}`)
  }
  if (criteria.price?.max) {
    parts.push(`Price < $${criteria.price.max}`)
  }

  if (criteria.volume?.min) {
    parts.push(`Volume > ${criteria.volume.min.toLocaleString()}`)
  }

  if (criteria.sector && criteria.sector.length > 0) {
    parts.push(`Sectors: ${criteria.sector.join(", ")}`)
  }

  return parts.join(" AND ")
}

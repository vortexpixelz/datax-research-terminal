// Kalshi REST client helpers for prediction market data
// Documentation: https://docs.kalshi.com/reference/welcome

const KALSHI_BASE_URL = process.env.KALSHI_API_URL ?? "https://trading-api.kalshi.com/v1"

let cachedKalshiToken: string | null = null

export interface KalshiMarket {
  ticker: string
  title: string
  category: string
  yes_price: number
  no_price: number
  volume: number
  open_interest: number
  close_date: string
  status: "active" | "closed" | "settled"
}

export interface KalshiMarketPrices {
  ticker: string
  yes_price: number
  no_price: number
  last_price: number
  updated_at?: string
}

export interface KalshiTrade {
  ticker: string
  side: "yes" | "no"
  price: number
  count: number
  timestamp: number
}

export async function getKalshiMarkets(): Promise<KalshiMarket[]> {
  const token = await getKalshiAuthToken()

  if (!token) {
    console.log("[v0] Kalshi auth token unavailable, returning mock markets")
    return getMockKalshiMarkets()
  }

  try {
    const response = await fetch(`${KALSHI_BASE_URL}/markets?status=open`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Kalshi API error: ${response.status}`)
    }

    const data = await response.json()
    const markets = Array.isArray(data?.markets) ? data.markets : []

    if (!markets.length) {
      return getMockKalshiMarkets()
    }

    return markets.map(mapKalshiMarket)
  } catch (error) {
    console.error("[v0] Error fetching Kalshi markets:", error)
    return getMockKalshiMarkets()
  }
}

export async function getKalshiMarketPrices(ticker: string): Promise<KalshiMarketPrices | null> {
  const token = await getKalshiAuthToken()

  if (!token) {
    console.log("[v0] Kalshi auth token unavailable for prices, returning mock data")
    return getMockKalshiMarketPrices(ticker)
  }

  try {
    const response = await fetch(`${KALSHI_BASE_URL}/markets/${encodeURIComponent(ticker)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Kalshi API error: ${response.status}`)
    }

    const data = await response.json()
    const market = data?.market

    if (!market) {
      return getMockKalshiMarketPrices(ticker)
    }

    const mapped = mapKalshiMarket(market)

    return {
      ticker: mapped.ticker,
      yes_price: mapped.yes_price,
      no_price: mapped.no_price,
      last_price: normalizeProbability(market?.last_price, mapped.yes_price),
      updated_at: market?.updated_at ?? market?.close_time ?? undefined,
    }
  } catch (error) {
    console.error("[v0] Error fetching Kalshi market prices:", error)
    return getMockKalshiMarketPrices(ticker)
  }
}

export function formatProbability(price: number): string {
  return `${(price * 100).toFixed(1)}%`
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

async function getKalshiAuthToken(): Promise<string | null> {
  if (cachedKalshiToken) {
    return cachedKalshiToken
  }

  const tokenFromEnv = process.env.KALSHI_API_TOKEN
  if (tokenFromEnv) {
    cachedKalshiToken = tokenFromEnv
    return cachedKalshiToken
  }

  const email = process.env.KALSHI_EMAIL
  const password = process.env.KALSHI_PASSWORD

  if (!email || !password) {
    console.log("[v0] KALSHI credentials not found in environment variables")
    return null
  }

  try {
    const response = await fetch(`${KALSHI_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error(`Kalshi login failed: ${response.status}`)
    }

    const data = await response.json()
    const token = data?.token ?? data?.access_token

    if (!token) {
      console.error("[v0] Kalshi login succeeded but no token returned")
      return null
    }

    cachedKalshiToken = token
    return cachedKalshiToken
  } catch (error) {
    console.error("[v0] Error logging into Kalshi:", error)
    return null
  }
}

function mapKalshiMarket(market: any): KalshiMarket {
  const yesPrice = normalizeProbability(
    market?.yes_price ?? market?.yes_bid ?? market?.yes_ask ?? market?.last_price,
    0.5,
  )
  const noPrice = normalizeProbability(market?.no_price ?? market?.no_bid ?? market?.no_ask, 1 - yesPrice)

  return {
    ticker: market?.ticker ?? market?.market_ticker ?? "",
    title: market?.title ?? market?.name ?? "",
    category: market?.category ?? market?.event_category ?? "General",
    yes_price: yesPrice,
    no_price: noPrice,
    volume: Number.parseFloat(market?.volume ?? market?.volume_total ?? 0) || 0,
    open_interest: Number.parseFloat(market?.open_interest ?? market?.oi ?? 0) || 0,
    close_date: market?.close_date ?? market?.close_time ?? market?.end_date ?? new Date().toISOString(),
    status: (market?.status as KalshiMarket["status"]) ?? "active",
  }
}

function normalizeProbability(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : Number.parseFloat(value as string)

  if (Number.isFinite(num)) {
    if (num > 1) {
      return Math.min(Math.max(num / 100, 0), 1)
    }
    return Math.min(Math.max(num, 0), 1)
  }

  return Math.min(Math.max(fallback, 0), 1)
}

function getMockKalshiMarketPrices(ticker: string): KalshiMarketPrices {
  const markets = getMockKalshiMarkets()
  const market = markets.find((m) => m.ticker === ticker)

  if (!market) {
    return {
      ticker,
      yes_price: 0.5,
      no_price: 0.5,
      last_price: 0.5,
    }
  }

  return {
    ticker: market.ticker,
    yes_price: market.yes_price,
    no_price: market.no_price,
    last_price: market.yes_price,
  }
}

function getMockKalshiMarkets(): KalshiMarket[] {
  return [
    {
      ticker: "FED-23DEC-T5.50",
      title: "Will the Fed rate be above 5.5% in Dec 2023?",
      category: "Economics",
      yes_price: 0.72,
      no_price: 0.28,
      volume: 125430,
      open_interest: 45230,
      close_date: "2023-12-31",
      status: "active",
    },
    {
      ticker: "INFL-23NOV-T3.5",
      title: "Will CPI inflation be above 3.5% in Nov?",
      category: "Economics",
      yes_price: 0.58,
      no_price: 0.42,
      volume: 89560,
      open_interest: 32100,
      close_date: "2023-11-30",
      status: "active",
    },
    {
      ticker: "BTCUSD-23DEC-T40K",
      title: "Will Bitcoin be above $40K in December?",
      category: "Crypto",
      yes_price: 0.45,
      no_price: 0.55,
      volume: 234500,
      open_interest: 78900,
      close_date: "2023-12-31",
      status: "active",
    },
    {
      ticker: "UNEMP-23NOV-T4.0",
      title: "Will unemployment be below 4.0% in Nov?",
      category: "Economics",
      yes_price: 0.82,
      no_price: 0.18,
      volume: 67800,
      open_interest: 23400,
      close_date: "2023-11-30",
      status: "active",
    },
    {
      ticker: "SPX-23DEC-T4500",
      title: "Will S&P 500 be above 4500 in December?",
      category: "Markets",
      yes_price: 0.64,
      no_price: 0.36,
      volume: 156700,
      open_interest: 54200,
      close_date: "2023-12-31",
      status: "active",
    },
    {
      ticker: "GDP-23Q4-T2.5",
      title: "Will Q4 GDP growth be above 2.5%?",
      category: "Economics",
      yes_price: 0.51,
      no_price: 0.49,
      volume: 45600,
      open_interest: 18900,
      close_date: "2024-01-31",
      status: "active",
    },
  ]
}

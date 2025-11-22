// Polygon.io API client for market data
// API Key should be stored in environment variable: POLYGON_API_KEY

const POLYGON_BASE_URL = "https://api.polygon.io"

export interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  previousClose: number
  timestamp: number
}

export interface StockDetails {
  symbol: string
  name: string
  description: string
  marketCap: number
  sector: string
  industry: string
  employees: number
  ceo: string
  website: string
}

export interface HistoricalBar {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface MarketNewsItem {
  id: string
  title: string
  url: string
  summary: string
  publishedAt: string
  source: string
}

// Get real-time quote for a symbol
export async function getQuote(symbol: string): Promise<StockQuote | null> {
  const apiKey = process.env.POLYGON_API_KEY

  if (!apiKey) {
    console.log("[v0] POLYGON_API_KEY not found in environment variables")
    return getMockQuote(symbol)
  }

  try {
    const response = await fetch(`${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/prev?apiKey=${apiKey}`)

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      symbol: data.ticker,
      price: data.results[0].c,
      change: data.results[0].c - data.results[0].o,
      changePercent: ((data.results[0].c - data.results[0].o) / data.results[0].o) * 100,
      volume: data.results[0].v,
      high: data.results[0].h,
      low: data.results[0].l,
      open: data.results[0].o,
      previousClose: data.results[0].c,
      timestamp: data.results[0].t,
    }
  } catch (error) {
    console.error("[v0] Error fetching quote:", error)
    return getMockQuote(symbol)
  }
}

// Get stock details
export async function getStockDetails(symbol: string): Promise<StockDetails | null> {
  const apiKey = process.env.POLYGON_API_KEY

  if (!apiKey) {
    console.log("[v0] POLYGON_API_KEY not found, returning mock data")
    return getMockStockDetails(symbol)
  }

  try {
    const response = await fetch(`${POLYGON_BASE_URL}/v3/reference/tickers/${symbol}?apiKey=${apiKey}`)

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      symbol: data.results.ticker,
      name: data.results.name,
      description: data.results.description || "",
      marketCap: data.results.market_cap || 0,
      sector: data.results.sic_description || "",
      industry: data.results.sic_description || "",
      employees: data.results.total_employees || 0,
      ceo: data.results.ceo || "",
      website: data.results.homepage_url || "",
    }
  } catch (error) {
    console.error("[v0] Error fetching stock details:", error)
    return getMockStockDetails(symbol)
  }
}

// Get historical data
export async function getHistoricalData(
  symbol: string,
  from: string,
  to: string,
  timespan: "day" | "week" | "month" = "day",
): Promise<HistoricalBar[]> {
  const apiKey = process.env.POLYGON_API_KEY

  if (!apiKey) {
    console.log("[v0] POLYGON_API_KEY not found, returning mock data")
    return getMockHistoricalData(symbol)
  }

  try {
    const response = await fetch(
      `${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/range/1/${timespan}/${from}/${to}?apiKey=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }

    const data = await response.json()

    return data.results.map((bar: any) => ({
      timestamp: bar.t,
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }))
  } catch (error) {
    console.error("[v0] Error fetching historical data:", error)
    return getMockHistoricalData(symbol)
  }
}

export async function getMarketNews(limit = 8): Promise<MarketNewsItem[]> {
  const apiKey = process.env.POLYGON_API_KEY

  if (!apiKey) {
    console.log("[v0] POLYGON_API_KEY not found, returning mock market news")
    return getMockMarketNews()
  }

  try {
    const url = new URL(`${POLYGON_BASE_URL}/v2/reference/news`)
    url.searchParams.set("limit", String(limit))
    url.searchParams.set("order", "desc")
    url.searchParams.set("sort", "published_utc")
    url.searchParams.set("apiKey", apiKey)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data.results)) {
      return getMockMarketNews()
    }

    return data.results.map((item: any) => ({
      id: item.id ?? item.article_url,
      title: item.title ?? "Untitled",
      url: item.article_url ?? "#",
      summary: item.description ?? item.summary ?? "",
      publishedAt: item.published_utc ?? new Date().toISOString(),
      source: item.publisher?.name ?? "Polygon",
    }))
  } catch (error) {
    console.error("[v0] Error fetching market news:", error)
    return getMockMarketNews()
  }
}

// Mock data functions for development
function getMockQuote(symbol: string): StockQuote {
  const basePrice = 100 + Math.random() * 400
  const change = (Math.random() - 0.5) * 10

  return {
    symbol,
    price: basePrice,
    change,
    changePercent: (change / basePrice) * 100,
    volume: Math.floor(Math.random() * 10000000),
    high: basePrice + Math.random() * 5,
    low: basePrice - Math.random() * 5,
    open: basePrice - change,
    previousClose: basePrice - change,
    timestamp: Date.now(),
  }
}

function getMockStockDetails(symbol: string): StockDetails {
  return {
    symbol,
    name: `${symbol} Inc.`,
    description: "A leading technology company focused on innovation and growth.",
    marketCap: 1000000000000,
    sector: "Technology",
    industry: "Software",
    employees: 50000,
    ceo: "John Doe",
    website: `https://${symbol.toLowerCase()}.com`,
  }
}

function getMockHistoricalData(symbol: string): HistoricalBar[] {
  const bars: HistoricalBar[] = []
  const now = Date.now()
  const basePrice = 100 + Math.random() * 400

  for (let i = 30; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000
    const open = basePrice + (Math.random() - 0.5) * 20
    const close = open + (Math.random() - 0.5) * 10
    const high = Math.max(open, close) + Math.random() * 5
    const low = Math.min(open, close) - Math.random() * 5

    bars.push({
      timestamp,
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000),
    })
  }

  return bars
}

function getMockMarketNews(): MarketNewsItem[] {
  const now = new Date()

  return [
    {
      id: "mock-1",
      title: "Tech Stocks Rally as AI Demand Surges",
      url: "https://example.com/news/tech-ai-demand",
      summary: "Mega-cap technology shares led gains in U.S. markets as investors rotated into AI beneficiaries following a fresh wave of enterprise spending forecasts.",
      publishedAt: new Date(now.getTime() - 15 * 60000).toISOString(),
      source: "MarketWatch",
    },
    {
      id: "mock-2",
      title: "Treasury Yields Slip Ahead of Fed Meeting",
      url: "https://example.com/news/treasury-yields-fed",
      summary: "Bond markets priced a higher probability of rate cuts later this year, sending the 10-year yield lower and boosting rate-sensitive equities.",
      publishedAt: new Date(now.getTime() - 45 * 60000).toISOString(),
      source: "Bloomberg",
    },
    {
      id: "mock-3",
      title: "Oil Prices Stabilize as OPEC Signals Flexibility",
      url: "https://example.com/news/opec-oil-prices",
      summary: "Crude futures steadied after OPEC+ members indicated they could adjust output targets swiftly if demand weakens into year-end.",
      publishedAt: new Date(now.getTime() - 90 * 60000).toISOString(),
      source: "Reuters",
    },
    {
      id: "mock-4",
      title: "Dollar Weakens with Softening Economic Data",
      url: "https://example.com/news/dollar-weakness",
      summary: "The U.S. dollar index slipped to a two-week low as manufacturing surveys showed cooling momentum, lifting commodities and emerging-market currencies.",
      publishedAt: new Date(now.getTime() - 2 * 60 * 60000).toISOString(),
      source: "Financial Times",
    },
  ]
}

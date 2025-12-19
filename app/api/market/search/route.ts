import { type NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"

async function handler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const apiKey = process.env.POLYGON_API_KEY

  if (!apiKey) {
    // Return mock data for development
    return NextResponse.json({
      results: getMockSearchResults(query),
    })
  }

  try {
    const response = await fetch(
      `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=10&apiKey=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }

    const data = await response.json()

    const results = data.results?.map((ticker: any) => ({
      symbol: ticker.ticker,
      name: ticker.name,
      type: ticker.type,
      exchange: ticker.primary_exchange || ticker.market,
    }))

    return NextResponse.json({ results: results || [] })
  } catch (error) {
    console.error("[v0] Error searching tickers:", error)
    Sentry.captureException(error)
    return NextResponse.json({
      results: getMockSearchResults(query),
    })
  }
}

export const GET = Sentry.wrapRouteHandlerWithSentry(handler, "/api/market/search")

function getMockSearchResults(query: string): any[] {
  const mockTickers = [
    { symbol: "AAPL", name: "Apple Inc.", type: "CS", exchange: "NASDAQ" },
    { symbol: "MSFT", name: "Microsoft Corporation", type: "CS", exchange: "NASDAQ" },
    { symbol: "GOOGL", name: "Alphabet Inc. Class A", type: "CS", exchange: "NASDAQ" },
    { symbol: "AMZN", name: "Amazon.com Inc.", type: "CS", exchange: "NASDAQ" },
    { symbol: "TSLA", name: "Tesla, Inc.", type: "CS", exchange: "NASDAQ" },
    { symbol: "NVDA", name: "NVIDIA Corporation", type: "CS", exchange: "NASDAQ" },
    { symbol: "META", name: "Meta Platforms Inc.", type: "CS", exchange: "NASDAQ" },
    { symbol: "BRK.A", name: "Berkshire Hathaway Inc. Class A", type: "CS", exchange: "NYSE" },
  ]

  return mockTickers.filter(
    (t) => t.symbol.toLowerCase().includes(query.toLowerCase()) || t.name.toLowerCase().includes(query.toLowerCase()),
  )
}

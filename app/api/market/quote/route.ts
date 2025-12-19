import { type NextRequest, NextResponse } from "next/server"
import * as Sentry from "@sentry/nextjs"
import { getQuote } from "@/lib/api/polygon"

async function handler(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
  }

  try {
    const quote = await getQuote(symbol.toUpperCase())

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error("[v0] Error in quote API:", error)
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 })
  }
}

export const GET = Sentry.wrapRouteHandlerWithSentry(handler, "/api/market/quote")

import { type NextRequest, NextResponse } from "next/server"
import { getHistoricalData, type Timespan } from "@/lib/api/polygon"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get("symbol")
  const from = searchParams.get("from")
  const to = searchParams.get("to")
  const timespan = (searchParams.get("timespan") as Timespan | null) || "day"
  const multiplier = Number(searchParams.get("multiplier") ?? "1") || 1

  if (!symbol || !from || !to) {
    return NextResponse.json({ error: "Symbol, from, and to parameters are required" }, { status: 400 })
  }

  try {
    const history = await getHistoricalData(symbol.toUpperCase(), from, to, timespan, multiplier)

    return NextResponse.json(history)
  } catch (error) {
    console.error("[v0] Error in history API:", error)
    return NextResponse.json({ error: "Failed to fetch historical data" }, { status: 500 })
  }
}

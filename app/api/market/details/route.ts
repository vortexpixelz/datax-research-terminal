import { type NextRequest, NextResponse } from "next/server"
import { getStockDetails } from "@/lib/api/polygon"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get("symbol")

  if (!symbol) {
    return NextResponse.json({ error: "Symbol parameter is required" }, { status: 400 })
  }

  try {
    const details = await getStockDetails(symbol.toUpperCase())

    if (!details) {
      return NextResponse.json({ error: "Stock details not found" }, { status: 404 })
    }

    return NextResponse.json(details)
  } catch (error) {
    console.error("[v0] Error in details API:", error)
    return NextResponse.json({ error: "Failed to fetch stock details" }, { status: 500 })
  }
}

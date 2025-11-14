import { type NextRequest, NextResponse } from "next/server"
import { getMarketNews } from "@/lib/api/polygon"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limitParam = searchParams.get("limit")
  const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10) || 0, 1), 50) : 8

  try {
    const news = await getMarketNews(limit)
    return NextResponse.json(news)
  } catch (error) {
    console.error("[v0] Error in market news API:", error)
    return NextResponse.json({ error: "Failed to fetch market news" }, { status: 500 })
  }
}

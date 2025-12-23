// Server-side WebSocket connection to Polygon.io
// Streams updates to clients via Server-Sent Events (SSE)

import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const encoder = new TextEncoder()

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Store active WebSocket connection
let polygonWs: any = null

type SubscriberRecord = {
  tickers: Set<string>
  heartbeat: ReturnType<typeof setInterval>
}

const subscribers = new Map<ReadableStreamDefaultController, SubscriberRecord>()
const tickerCounts = new Map<string, number>()

function sanitizeTickers(tickers: string[]) {
  return Array.from(
    new Set(
      tickers
        .map((ticker) => ticker?.trim().toUpperCase())
        .filter((ticker): ticker is string => Boolean(ticker))
    )
  )
}

function tickerSymbols(tickers: string[]) {
  return tickers.flatMap((ticker) => [`T.${ticker}`, `A.${ticker}`])
}

function subscribeToPolygon(tickers: string[]) {
  if (!polygonWs || polygonWs.readyState !== 1) return

  const params = tickerSymbols(tickers)
  if (params.length === 0) return

  polygonWs.send(JSON.stringify({ action: "subscribe", params: params.join(",") }))
  console.log(`[v0] Subscribed to ${tickers.join(", ")}`)
}

function unsubscribeFromPolygon(tickers: string[]) {
  if (!polygonWs || polygonWs.readyState !== 1) return

  const params = tickerSymbols(tickers)
  if (params.length === 0) return

  polygonWs.send(JSON.stringify({ action: "unsubscribe", params: params.join(",") }))
  console.log(`[v0] Unsubscribed from ${tickers.join(", ")}`)
}

function incrementTickerCounts(tickers: string[]) {
  const unique = sanitizeTickers(tickers)
  if (unique.length === 0) return

  const newlySubscribed: string[] = []

  unique.forEach((ticker) => {
    const current = tickerCounts.get(ticker) ?? 0
    tickerCounts.set(ticker, current + 1)
    if (current === 0) {
      newlySubscribed.push(ticker)
    }
  })

  if (newlySubscribed.length > 0) {
    subscribeToPolygon(newlySubscribed)
  }
}

function decrementTickerCounts(tickers: string[]) {
  const unique = sanitizeTickers(tickers)
  if (unique.length === 0) return [] as string[]

  const removed: string[] = []

  unique.forEach((ticker) => {
    const current = tickerCounts.get(ticker)
    if (!current) return

    if (current <= 1) {
      tickerCounts.delete(ticker)
      removed.push(ticker)
    } else {
      tickerCounts.set(ticker, current - 1)
    }
  })

  if (removed.length > 0) {
    unsubscribeFromPolygon(removed)
  }

  return removed
}

function cleanupSubscriber(controller: ReadableStreamDefaultController) {
  const record = subscribers.get(controller)
  if (!record) return

  subscribers.delete(controller)
  clearInterval(record.heartbeat)
  decrementTickerCounts(Array.from(record.tickers))
}

function connectToPolygon() {
  if (polygonWs && (polygonWs.readyState === 0 || polygonWs.readyState === 1)) return

  const apiKey = process.env.POLYGON_API_KEY
  if (!apiKey) {
    console.log("[v0] POLYGON_API_KEY not set, using mock data")
    return
  }

  // Dynamic import for WebSocket in Node.js
  const WebSocket = require("ws")

  polygonWs = new WebSocket("wss://socket.polygon.io/stocks")

  polygonWs.on("open", () => {
    console.log("[v0] Server connected to Polygon WebSocket")
    polygonWs.send(JSON.stringify({ action: "auth", params: apiKey }))

    const activeTickers = Array.from(tickerCounts.keys())
    if (activeTickers.length > 0) {
      subscribeToPolygon(activeTickers)
    }
  })

  polygonWs.on("message", (data: any) => {
    const messages = JSON.parse(data.toString())
    if (!Array.isArray(messages)) return

    messages.forEach((msg: any) => {
      // Broadcast to all subscribers
      const event = {
        type: msg.ev,
        data: msg,
      }

      subscribers.forEach((record, controller) => {
        try {
          const payload = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(payload))
        } catch (error) {
          console.error("[v0] Error sending to subscriber:", error)
        }
      })
    })
  })

  polygonWs.on("error", (error: any) => {
    console.error("[v0] Polygon WebSocket error:", error)
  })

  polygonWs.on("close", () => {
    console.log("[v0] Polygon WebSocket closed, reconnecting in 5s...")
    polygonWs = null
    setTimeout(connectToPolygon, 5000)
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tickers = sanitizeTickers(searchParams.get("tickers")?.split(",") || [])

  // Connect to Polygon if not already connected
  connectToPolygon()

  const stream = new ReadableStream({
    start(controller) {
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      subscribers.set(controller, {
        heartbeat,
        tickers: new Set(tickers),
      })

      incrementTickerCounts(tickers)

      const payload = `data: ${JSON.stringify({ type: "connected" })}\n\n`
      controller.enqueue(encoder.encode(payload))

      request.signal.addEventListener("abort", () => {
        cleanupSubscriber(controller)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body?.action
    const tickers = Array.isArray(body?.tickers) ? body.tickers : []
    const sanitized = sanitizeTickers(tickers)

    if (sanitized.length === 0) {
      return NextResponse.json({ success: true, processed: [] })
    }

    if (action === "unsubscribe") {
      const removed = decrementTickerCounts(sanitized)
      return NextResponse.json({ success: true, processed: removed })
    }

    if (action === "subscribe") {
      incrementTickerCounts(sanitized)
      return NextResponse.json({ success: true, processed: sanitized })
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error handling stream POST:", error)
    return NextResponse.json({ success: false, error: "Internal error" }, { status: 500 })
  }
}

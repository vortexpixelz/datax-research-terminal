// Server-side WebSocket connection to Polygon.io
// Streams updates to clients via Server-Sent Events (SSE)

import type { NextRequest } from "next/server"

const encoder = new TextEncoder()

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Store active WebSocket connection
let polygonWs: any = null
const subscribers = new Set<ReadableStreamDefaultController>()

function connectToPolygon() {
  if (polygonWs?.readyState === 1) return // Already connected

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

      subscribers.forEach((controller) => {
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
  const tickers = searchParams.get("tickers")?.split(",") || []

  // Connect to Polygon if not already connected
  connectToPolygon()

  // Subscribe to tickers
  if (polygonWs?.readyState === 1 && tickers.length > 0) {
    const subscriptions = tickers.flatMap((t) => [`T.${t}`, `A.${t}`]).join(",")
    polygonWs.send(JSON.stringify({ action: "subscribe", params: subscriptions }))
    console.log(`[v0] Subscribed to ${tickers.join(", ")}`)
  }

  const stream = new ReadableStream({
    start(controller) {
      subscribers.add(controller)

      // Send initial connection message
      const payload = `data: ${JSON.stringify({ type: "connected" })}\n\n`
      controller.enqueue(encoder.encode(payload))

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        subscribers.delete(controller)
        clearInterval(heartbeat)
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

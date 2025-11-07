"use client"

import { useState, useEffect } from "react"

export interface TickerUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

export function useRealtimeTicker(tickers: string[]) {
  const [updates, setUpdates] = useState<Map<string, TickerUpdate>>(new Map())
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (tickers.length === 0) return

    const eventSource = new EventSource(`/api/market/stream?tickers=${tickers.join(",")}`)

    eventSource.onopen = () => {
      console.log("[v0] Connected to market stream")
      setConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        if (message.type === "T" || message.type === "A") {
          const data = message.data
          const symbol = data.sym
          const price = data.p || data.c

          setUpdates((prev) => {
            const newMap = new Map(prev)
            const existing = newMap.get(symbol)
            const lastPrice = existing?.price || price
            const change = price - lastPrice
            const changePercent = lastPrice !== 0 ? (change / lastPrice) * 100 : 0

            newMap.set(symbol, {
              symbol,
              price,
              change,
              changePercent,
              volume: data.v || 0,
              timestamp: data.t || Date.now(),
            })

            return newMap
          })
        }
      } catch (error) {
        console.error("[v0] Error parsing stream data:", error)
      }
    }

    eventSource.onerror = () => {
      console.error("[v0] Market stream error")
      setConnected(false)
    }

    return () => {
      eventSource.close()
      setConnected(false)
    }
  }, [tickers.join(",")])

  return { updates, connected }
}

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

export interface TickerUpdate {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
}

function normalizeTickers(tickers: string[]) {
  return Array.from(
    new Set(
      tickers
        .map((ticker) => ticker?.trim().toUpperCase())
        .filter((ticker): ticker is string => Boolean(ticker))
    )
  ).sort()
}

async function notifyUnsubscribe(tickers: string[]) {
  if (tickers.length === 0) return

  try {
    await fetch("/api/market/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unsubscribe", tickers }),
      keepalive: true,
    })
  } catch (error) {
    console.error("[v0] Failed to notify unsubscribe:", error)
  }
}

export function useRealtimeTicker(tickers: string[]) {
  const [updates, setUpdates] = useState<Map<string, TickerUpdate>>(new Map())
  const [connected, setConnected] = useState(false)
  const previousTickersRef = useRef<string[]>([])
  const eventSourceRef = useRef<EventSource | null>(null)

  const normalizedTickers = useMemo(() => normalizeTickers(tickers), [tickers])

  const removeTickerUpdates = useCallback((symbols: string[]) => {
    if (symbols.length === 0) return

    setUpdates((prev) => {
      if (prev.size === 0) return prev

      const next = new Map(prev)
      let mutated = false

      symbols.forEach((symbol) => {
        if (next.delete(symbol)) {
          mutated = true
        }
      })

      return mutated ? next : prev
    })
  }, [])

  useEffect(() => {
    const previousTickers = previousTickersRef.current
    const removedTickers = previousTickers.filter((ticker) => !normalizedTickers.includes(ticker))
    const addedTickers = normalizedTickers.filter((ticker) => !previousTickers.includes(ticker))

    if (removedTickers.length > 0) {
      removeTickerUpdates(removedTickers)
      void notifyUnsubscribe(removedTickers)
    }

    if (normalizedTickers.length === 0) {
      previousTickersRef.current = []
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
      setConnected(false)
      return
    }

    const shouldReconnect =
      !eventSourceRef.current || removedTickers.length > 0 || addedTickers.length > 0

    if (!shouldReconnect) {
      return
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setConnected(false)
    }

    const url = `/api/market/stream?tickers=${encodeURIComponent(normalizedTickers.join(","))}`
    const eventSource = new EventSource(url)
    eventSourceRef.current = eventSource
    previousTickersRef.current = normalizedTickers

    eventSource.onopen = () => {
      console.log("[v0] Connected to market stream")
      if (eventSourceRef.current === eventSource) {
        setConnected(true)
      }
    }

    eventSource.onmessage = (event) => {
      if (eventSourceRef.current !== eventSource) return

      try {
        const message = JSON.parse(event.data)

        if (message.type === "T" || message.type === "A") {
          const data = message.data
          const symbol = data.sym
          const price = data.p || data.c

          setUpdates((prev) => {
            const newMap = new Map(prev)
            const existing = newMap.get(symbol)
            const lastPrice = existing?.price ?? price
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
      if (eventSourceRef.current === eventSource) {
        console.error("[v0] Market stream error")
        setConnected(false)
      }
    }

    return () => {
      eventSource.close()
      if (eventSourceRef.current === eventSource) {
        eventSourceRef.current = null
      }
      setConnected(false)
    }
  }, [normalizedTickers, removeTickerUpdates])

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }

      const remainingTickers = previousTickersRef.current
      if (remainingTickers.length > 0) {
        void notifyUnsubscribe(remainingTickers)
        previousTickersRef.current = []
      }
    }
  }, [])

  return { updates, connected }
}

import { useEffect, useState, useCallback, useRef } from "react"
import {
  getKalshiClient,
  MarketUpdate,
  fetchKalshiMarkets,
} from "@/lib/api/kalshi-ws"

interface UseKalshiStreamOptions {
  marketIds?: string[]
  category?: string
  fallbackToRest?: boolean
}

/**
 * Hook for subscribing to Kalshi market streams
 */
export function useKalshiStream({
  marketIds = [],
  category,
  fallbackToRest = true,
}: UseKalshiStreamOptions = {}) {
  const [markets, setMarkets] = useState<MarketUpdate[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const clientRef = useRef(getKalshiClient())
  const unsubscribersRef = useRef<Map<string, () => void>>(new Map())

  // Initialize connection
  useEffect(() => {
    const client = clientRef.current

    const initializeConnection = async () => {
      try {
        // Try WebSocket connection
        await client.connect()
        setIsConnected(client.isConnectedStatus())
        setError(null)

        // Subscribe to markets
        if (marketIds.length > 0) {
          client.subscribe(marketIds)

          // Set up listeners
          marketIds.forEach((marketId) => {
            const unsubscribe = client.on(marketId, (data) => {
              setMarkets((prev) => {
                const index = prev.findIndex((m) => m.market_id === marketId)
                if (index >= 0) {
                  const updated = [...prev]
                  updated[index] = data
                  return updated
                }
                return [...prev, data]
              })
            })

            unsubscribersRef.current.set(marketId, unsubscribe)
          })
        }
      } catch (err) {
        console.error("Failed to connect to Kalshi WebSocket:", err)
        setIsConnected(false)
        setError("Failed to connect to WebSocket")

        // Fallback to REST API
        if (fallbackToRest) {
          try {
            const data = await fetchKalshiMarkets(category)
            setMarkets(data)
            setError(null)
          } catch (restErr) {
            setError("Failed to fetch market data")
          }
        }
      }
    }

    initializeConnection()

    return () => {
      // Cleanup listeners
      unsubscribersRef.current.forEach((unsubscribe) => {
        unsubscribe()
      })
      unsubscribersRef.current.clear()

      // Unsubscribe from markets
      if (marketIds.length > 0) {
        client.unsubscribe(marketIds)
      }
    }
  }, [marketIds, category, fallbackToRest])

  const subscribe = useCallback(
    (newMarketIds: string[]) => {
      const client = clientRef.current

      newMarketIds.forEach((marketId) => {
        if (!unsubscribersRef.current.has(marketId)) {
          client.subscribe([marketId])

          const unsubscribe = client.on(marketId, (data) => {
            setMarkets((prev) => {
              const index = prev.findIndex((m) => m.market_id === marketId)
              if (index >= 0) {
                const updated = [...prev]
                updated[index] = data
                return updated
              }
              return [...prev, data]
            })
          })

          unsubscribersRef.current.set(marketId, unsubscribe)
        }
      })
    },
    []
  )

  const unsubscribe = useCallback((marketIdsToRemove: string[]) => {
    const client = clientRef.current

    marketIdsToRemove.forEach((marketId) => {
      const unsubscribe = unsubscribersRef.current.get(marketId)
      if (unsubscribe) {
        unsubscribe()
        unsubscribersRef.current.delete(marketId)
      }

      client.unsubscribe([marketId])
      setMarkets((prev) => prev.filter((m) => m.market_id !== marketId))
    })
  }, [])

  return {
    markets,
    isConnected,
    error,
    subscribe,
    unsubscribe,
  }
}

/**
 * Hook for fetching Kalshi markets via REST API (for initial load or fallback)
 */
export function useKalshiMarkets(category?: string) {
  const [markets, setMarkets] = useState<MarketUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true)
        const data = await fetchKalshiMarkets(category)
        setMarkets(data)
        setError(null)
      } catch (err) {
        setError("Failed to fetch markets")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [category])

  return { markets, loading, error }
}

/**
 * Hook for a single market subscription
 */
export function useMarketPrice(marketId: string) {
  const [market, setMarket] = useState<MarketUpdate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const clientRef = useRef(getKalshiClient())
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const client = clientRef.current

    const initialize = async () => {
      try {
        // Try WebSocket
        if (!client.isConnectedStatus()) {
          await client.connect()
        }

        client.subscribe([marketId])

        unsubscribeRef.current = client.on(marketId, (data) => {
          setMarket(data)
          setIsLoading(false)
        })
      } catch (err) {
        console.error("Failed to subscribe to market:", err)
        setIsLoading(false)
      }
    }

    initialize()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      client.unsubscribe([marketId])
    }
  }, [marketId])

  return { market, isLoading }
}

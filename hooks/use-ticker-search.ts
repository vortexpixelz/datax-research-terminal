"use client"

import { useState, useEffect } from "react"

export interface TickerSearchResult {
  symbol: string
  name: string
  type: string
  exchange: string
  price?: number
  change?: number
  changePercent?: number
}

export function useTickerSearch(query: string) {
  const [results, setResults] = useState<TickerSearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.length < 1) {
      setResults([])
      return
    }

    const searchTickers = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error("[v0] Error searching tickers:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchTickers, 300)
    return () => clearTimeout(debounce)
  }, [query])

  return { results, loading }
}

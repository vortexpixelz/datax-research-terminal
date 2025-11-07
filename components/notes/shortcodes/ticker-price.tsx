"use client"

import { useEffect, useState } from "react"
import { TrendingDown, TrendingUp } from "lucide-react"

interface TickerPriceProps {
  symbol: string
}

export function TickerPrice({ symbol }: TickerPriceProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPrice() {
      try {
        const response = await fetch(
          `/api/market/quote?symbol=${symbol}`
        )
        if (response.ok) {
          const quote = await response.json()
          setData(quote)
        }
      } catch (error) {
        console.error("Failed to fetch price:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrice()
  }, [symbol])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  if (!data) {
    return <div className="text-sm text-red-500">Unable to fetch price</div>
  }

  const isPositive = data.change >= 0

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/30 rounded-md border border-slate-600">
      <span className="font-semibold text-sm">{symbol}</span>
      <span className="text-sm">${data.price?.toFixed(2)}</span>
      <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span>
          {isPositive ? "+" : ""}{data.changePercent?.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

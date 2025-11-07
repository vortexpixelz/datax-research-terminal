"use client"

import { TrendingUp, TrendingDown } from "lucide-react"

type TopMoversProps = {
  type: "gainers" | "losers"
}

type StockMover = {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
}

export function TopMovers({ type }: TopMoversProps) {
  const gainers: StockMover[] = [
    { ticker: "NVDA", name: "NVIDIA Corp", price: 875.5, change: 45.2, changePercent: 5.44 },
    { ticker: "TSLA", name: "Tesla Inc", price: 245.3, change: 12.8, changePercent: 5.51 },
    { ticker: "AMD", name: "AMD Inc", price: 165.8, change: 8.9, changePercent: 5.67 },
    { ticker: "META", name: "Meta Platforms", price: 485.2, change: 18.5, changePercent: 3.96 },
    { ticker: "GOOGL", name: "Alphabet Inc", price: 142.3, change: 5.2, changePercent: 3.79 },
  ]

  const losers: StockMover[] = [
    { ticker: "INTC", name: "Intel Corp", price: 42.5, change: -3.8, changePercent: -8.21 },
    { ticker: "PYPL", name: "PayPal Holdings", price: 65.2, change: -4.2, changePercent: -6.05 },
    { ticker: "SNAP", name: "Snap Inc", price: 12.3, change: -0.9, changePercent: -6.82 },
    { ticker: "PINS", name: "Pinterest Inc", price: 28.5, change: -1.6, changePercent: -5.32 },
    { ticker: "UBER", name: "Uber Technologies", price: 72.8, change: -3.5, changePercent: -4.59 },
  ]

  const movers = type === "gainers" ? gainers : losers

  return (
    <div className="bg-card border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        {type === "gainers" ? (
          <>
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Gainers
          </>
        ) : (
          <>
            <TrendingDown className="h-5 w-5 text-red-600" />
            Top Losers
          </>
        )}
      </h3>
      <div className="space-y-3">
        {movers.map((stock) => (
          <div key={stock.ticker} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{stock.ticker}</div>
              <div className="text-xs text-muted-foreground">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">${stock.price.toFixed(2)}</div>
              <div className={`text-sm ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stock.change >= 0 ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

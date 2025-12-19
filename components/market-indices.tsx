"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

type IndexData = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

export function MarketIndices() {
  const [indices, setIndices] = useState<IndexData[]>([
    { symbol: "SPY", name: "S&P 500", price: 480.5, change: 5.2, changePercent: 1.09 },
    { symbol: "QQQ", name: "NASDAQ", price: 395.8, change: 8.4, changePercent: 2.17 },
    { symbol: "DIA", name: "Dow Jones", price: 385.2, change: -2.1, changePercent: -0.54 },
  ])

  return (
    <ul className="grid grid-cols-3 gap-4" aria-label="Major market indices">
      {indices.map((index) => (
        <li key={index.symbol} className="bg-card border rounded-lg p-4">
          <div className="text-sm text-muted-foreground">{index.name}</div>
          <div className="text-2xl font-semibold mt-1">${index.price.toFixed(2)}</div>
          <div
            className={`flex items-center gap-1 mt-2 text-sm ${index.change >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {index.change >= 0 ? (
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
            )}
            <span>
              {index.change >= 0 ? "+" : ""}
              {index.change.toFixed(2)}
            </span>
            <span>
              ({index.changePercent >= 0 ? "+" : ""}
              {index.changePercent.toFixed(2)}%)
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}

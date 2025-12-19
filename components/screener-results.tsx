"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StockResult } from "@/app/screener/page"

type ScreenerResultsProps = {
  stocks: StockResult[]
}

type SortKey = keyof StockResult
type SortDirection = "asc" | "desc"

export function ScreenerResults({ stocks }: ScreenerResultsProps) {
  const [sortKey, setSortKey] = useState<SortKey>("ticker")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("asc")
    }
  }

  const sortedStocks = [...stocks].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal
    }

    return 0
  })

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) return `$${(value / 1000000000000).toFixed(2)}T`
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`
    return `$${(value / 1000000).toFixed(2)}M`
  }

  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`
    return `${(value / 1000).toFixed(2)}K`
  }

  const SortButton = ({ label, sortKey: key }: { label: string; sortKey: SortKey }) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="font-medium hover:text-foreground transition-colors"
    >
      {label} {sortKey === key && (sortDirection === "asc" ? "↑" : "↓")}
    </button>
  )

  if (stocks.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-12 text-center">
        <p className="text-muted-foreground">No stocks match your criteria. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" aria-describedby="screener-results-caption">
          <caption id="screener-results-caption" className="sr-only">
            Screener results matching the selected filters
          </caption>
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="text-left p-4">
                <SortButton label="Ticker" sortKey="ticker" />
              </th>
              <th scope="col" className="text-left p-4">
                <SortButton label="Name" sortKey="name" />
              </th>
              <th scope="col" className="text-right p-4">
                <SortButton label="Price" sortKey="price" />
              </th>
              <th scope="col" className="text-right p-4">
                <SortButton label="Change %" sortKey="changePercent" />
              </th>
              <th scope="col" className="text-right p-4">
                <SortButton label="Market Cap" sortKey="marketCap" />
              </th>
              <th scope="col" className="text-right p-4">
                <SortButton label="P/E" sortKey="pe" />
              </th>
              <th scope="col" className="text-right p-4">
                <SortButton label="Volume" sortKey="volume" />
              </th>
              <th scope="col" className="text-left p-4">
                <SortButton label="Sector" sortKey="sector" />
              </th>
              <th scope="col" className="text-right p-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock) => (
              <tr key={stock.ticker} className="border-t hover:bg-muted/50">
                <td className="p-4 font-medium">{stock.ticker}</td>
                <td className="p-4 text-muted-foreground">{stock.name}</td>
                <td className="p-4 text-right">${stock.price.toFixed(2)}</td>
                <td className={`p-4 text-right ${stock.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                  <div className="flex items-center justify-end gap-1">
                    {stock.changePercent >= 0 ? (
                      <TrendingUp className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="h-4 w-4" aria-hidden="true" />
                    )}
                    {stock.changePercent >= 0 ? "+" : ""}
                    {stock.changePercent.toFixed(2)}%
                  </div>
                </td>
                <td className="p-4 text-right">{formatMarketCap(stock.marketCap)}</td>
                <td className="p-4 text-right">{stock.pe.toFixed(1)}</td>
                <td className="p-4 text-right">{formatVolume(stock.volume)}</td>
                <td className="p-4">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">{stock.sector}</span>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

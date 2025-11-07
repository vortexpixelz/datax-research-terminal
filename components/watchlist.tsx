"use client"

import { Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { WatchlistItem } from "@/app/portfolio/page"

type WatchlistProps = {
  items: WatchlistItem[]
  onRemove: (id: string) => void
}

export function Watchlist({ items, onRemove }: WatchlistProps) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <th className="text-left p-4 font-medium">Ticker</th>
            <th className="text-left p-4 font-medium">Name</th>
            <th className="text-right p-4 font-medium">Price</th>
            <th className="text-right p-4 font-medium">Change</th>
            <th className="text-right p-4 font-medium">Change %</th>
            <th className="text-right p-4 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-4 font-medium">{item.ticker}</td>
              <td className="p-4 text-muted-foreground">{item.name}</td>
              <td className="p-4 text-right">${item.price.toFixed(2)}</td>
              <td className={`p-4 text-right ${item.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {item.change >= 0 ? "+" : ""}${item.change.toFixed(2)}
              </td>
              <td className={`p-4 text-right ${item.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                <div className="flex items-center justify-end gap-1">
                  {item.changePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {item.changePercent >= 0 ? "+" : ""}
                  {item.changePercent.toFixed(2)}%
                </div>
              </td>
              <td className="p-4 text-right">
                <Button variant="ghost" size="icon" onClick={() => onRemove(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

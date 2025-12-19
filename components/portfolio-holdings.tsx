"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Holding } from "@/app/portfolio/page"

type PortfolioHoldingsProps = {
  holdings: Holding[]
  onRemove: (id: string) => void
}

export function PortfolioHoldings({ holdings, onRemove }: PortfolioHoldingsProps) {
  return (
    <div className="bg-card border rounded-lg overflow-hidden">
      <table className="w-full" aria-describedby="portfolio-holdings-caption">
        <caption id="portfolio-holdings-caption" className="sr-only">
          Portfolio holdings with current performance metrics
        </caption>
        <thead className="bg-muted">
          <tr>
            <th scope="col" className="text-left p-4 font-medium">
              Ticker
            </th>
            <th scope="col" className="text-left p-4 font-medium">
              Name
            </th>
            <th scope="col" className="text-right p-4 font-medium">
              Shares
            </th>
            <th scope="col" className="text-right p-4 font-medium">
              Avg Cost
            </th>
            <th scope="col" className="text-right p-4 font-medium">
              Current Price
            </th>
            <th scope="col" className="text-right p-4 font-medium">
              Market Value
            </th>
            <th scope="col" className="text-right p-4 font-medium">
              Gain/Loss
            </th>
            <th scope="col" className="text-right p-4 font-medium">
              Return %
            </th>
            <th scope="col" className="text-right p-4 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => {
            const marketValue = holding.shares * holding.currentPrice
            const totalCost = holding.shares * holding.avgCost
            const gain = marketValue - totalCost
            const gainPercent = (gain / totalCost) * 100

            return (
              <tr key={holding.id} className="border-t">
                <td className="p-4 font-medium">{holding.ticker}</td>
                <td className="p-4 text-muted-foreground">{holding.name}</td>
                <td className="p-4 text-right">{holding.shares}</td>
                <td className="p-4 text-right">${holding.avgCost.toFixed(2)}</td>
                <td className="p-4 text-right">${holding.currentPrice.toFixed(2)}</td>
                <td className="p-4 text-right font-medium">${marketValue.toFixed(2)}</td>
                <td className={`p-4 text-right ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {gain >= 0 ? "+" : ""}${gain.toFixed(2)}
                </td>
                <td className={`p-4 text-right ${gainPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {gainPercent >= 0 ? "+" : ""}
                  {gainPercent.toFixed(2)}%
                </td>
                <td className="p-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => onRemove(holding.id)}
                    aria-label={`Remove ${holding.ticker} from portfolio`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

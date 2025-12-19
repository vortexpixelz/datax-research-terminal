"use client"

import { TrendingUp, TrendingDown, DollarSign, PieChartIcon } from "lucide-react"
import { useLocaleFormatter } from "@/components/locale-provider"

type PortfolioStatsProps = {
  totalValue: number
  totalCost: number
  totalGain: number
  totalGainPercent: number
}

export function PortfolioStats({ totalValue, totalCost, totalGain, totalGainPercent }: PortfolioStatsProps) {
  const { formatNumber } = useLocaleFormatter()
  const numberOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }
  const gainPrefix = totalGain >= 0 ? "+" : "-"

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <DollarSign className="h-4 w-4" />
          Total Value
        </div>
        <div className="text-2xl font-semibold mt-2">
          ${formatNumber(totalValue, numberOptions)}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <DollarSign className="h-4 w-4" />
          Total Cost
        </div>
        <div className="text-2xl font-semibold mt-2">
          ${formatNumber(totalCost, numberOptions)}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {totalGain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          Total Gain/Loss
        </div>
        <div className={`text-2xl font-semibold mt-2 ${totalGain >= 0 ? "text-green-600" : "text-red-600"}`}>
          {gainPrefix}${formatNumber(Math.abs(totalGain), numberOptions)}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <PieChartIcon className="h-4 w-4" />
          Return
        </div>
        <div className={`text-2xl font-semibold mt-2 ${totalGainPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
          {totalGainPercent >= 0 ? "+" : ""}
          {totalGainPercent.toFixed(2)}%
        </div>
      </div>
    </div>
  )
}

import { TrendingUp, TrendingDown, DollarSign, PieChartIcon } from "lucide-react"

type PortfolioStatsProps = {
  totalValue: number
  totalCost: number
  totalGain: number
  totalGainPercent: number
}

export function PortfolioStats({ totalValue, totalCost, totalGain, totalGainPercent }: PortfolioStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <DollarSign className="h-4 w-4" />
          Total Value
        </div>
        <div className="text-2xl font-semibold mt-2">
          ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <DollarSign className="h-4 w-4" />
          Total Cost
        </div>
        <div className="text-2xl font-semibold mt-2">
          ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          {totalGain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          Total Gain/Loss
        </div>
        <div className={`text-2xl font-semibold mt-2 ${totalGain >= 0 ? "text-green-600" : "text-red-600"}`}>
          {totalGain >= 0 ? "+" : ""}$
          {totalGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

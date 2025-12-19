"use client"

import { useState, useEffect } from "react"
import { getKalshiMarkets, formatProbability, formatVolume, type KalshiMarket } from "@/lib/api/kalshi"
import { TrendingUp, TrendingDown } from "lucide-react"
import { useLocaleFormatter } from "@/components/locale-provider"

export function KalshiMarkets() {
  const [markets, setMarkets] = useState<KalshiMarket[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const { formatDateTime } = useLocaleFormatter()

  useEffect(() => {
    async function loadMarkets() {
      setLoading(true)
      const data = await getKalshiMarkets()
      setMarkets(data)
      setLoading(false)
    }
    loadMarkets()

    // Refresh every 30 seconds
    const interval = setInterval(loadMarkets, 30000)
    return () => clearInterval(interval)
  }, [])

  const categories = ["All", ...Array.from(new Set(markets.map((m) => m.category)))]
  const filteredMarkets = selectedCategory === "All" ? markets : markets.filter((m) => m.category === selectedCategory)

  if (loading) {
    return (
      <div className="bg-card border">
        <div className="border-b px-4 py-2 bg-muted">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider">PREDICTION MARKETS</h2>
        </div>
        <div className="p-8 text-center text-muted-foreground text-sm">Loading markets...</div>
      </div>
    )
  }

  return (
    <div className="bg-card border">
      <div className="border-b px-4 py-2 bg-muted">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-primary uppercase tracking-wider">PREDICTION MARKETS - KALSHI</h2>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 text-xs uppercase tracking-wider transition-colors ${
                  selectedCategory === cat ? "bg-primary text-primary-foreground" : "hover:bg-muted-foreground/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y">
        {filteredMarkets.map((market) => {
          const isLikely = market.yes_price > 0.5
          const probability = market.yes_price
          const priceChange = Math.random() > 0.5 // Mock change direction

          return (
            <div key={market.ticker} className="p-3 hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-primary">{market.ticker}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground uppercase tracking-wider">
                      {market.category}
                    </span>
                  </div>
                  <div className="text-sm mb-2">{market.title}</div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Vol: {formatVolume(market.volume)}</span>
                    <span>OI: {formatVolume(market.open_interest)}</span>
                    <span>Closes: {formatDateTime(new Date(market.close_date), { dateStyle: "medium" })}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <span className={`text-2xl font-bold font-mono ${isLikely ? "text-success" : "text-destructive"}`}>
                      {formatProbability(probability)}
                    </span>
                    {priceChange ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">{isLikely ? "LIKELY YES" : "LIKELY NO"}</div>
                  <div className="flex gap-1 mt-1">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Y:</span>
                      <span className="text-success ml-1 font-mono">{formatProbability(market.yes_price)}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">N:</span>
                      <span className="text-destructive ml-1 font-mono">{formatProbability(market.no_price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

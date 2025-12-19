"use client"

import { useState, useEffect } from "react"
import { Activity, TrendingUp, AlertCircle, DollarSign } from "lucide-react"
import { useLocaleFormatter } from "@/components/locale-provider"

interface MarketInsight {
  type: "trend" | "alert" | "volume" | "sentiment"
  title: string
  description: string
  value?: string
  timestamp: string
}

export function MarketInsights() {
  const [insights, setInsights] = useState<MarketInsight[]>([])
  const { formatDateTime } = useLocaleFormatter()

  useEffect(() => {
    // Mock insights - in production, this would come from analysis of market data
    const mockInsights: MarketInsight[] = [
      {
        type: "trend",
        title: "Fed Rate Expectations Rising",
        description: "Prediction markets show 72% probability of rates above 5.5%, up from 65% yesterday",
        value: "+7%",
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        type: "volume",
        title: "Bitcoin Markets See High Volume",
        description: "BTC prediction markets trading 234K contracts, 3x daily average",
        value: "234K",
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      },
      {
        type: "alert",
        title: "Inflation Data Expected Tomorrow",
        description: "CPI markets showing increased volatility ahead of tomorrow's release",
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      },
      {
        type: "sentiment",
        title: "S&P 500 Outlook Improving",
        description: "Market probability for S&P above 4500 increased to 64% from 58%",
        value: "+6%",
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      },
    ]
    setInsights(mockInsights)
  }, [])

  const getIcon = (type: MarketInsight["type"]) => {
    switch (type) {
      case "trend":
        return <TrendingUp className="w-4 h-4" />
      case "alert":
        return <AlertCircle className="w-4 h-4" />
      case "volume":
        return <DollarSign className="w-4 h-4" />
      case "sentiment":
        return <Activity className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: MarketInsight["type"]) => {
    switch (type) {
      case "trend":
        return "text-primary"
      case "alert":
        return "text-destructive"
      case "volume":
        return "text-success"
      case "sentiment":
        return "text-primary"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return formatDateTime(date, { dateStyle: "medium" })
  }

  return (
    <div className="bg-card border">
      <div className="border-b px-4 py-2 bg-muted">
        <h2 className="text-xs font-bold text-primary uppercase tracking-wider">MARKET INSIGHTS</h2>
      </div>

      <div className="divide-y max-h-96 overflow-y-auto">
        {insights.map((insight, idx) => (
          <div key={idx} className="p-3 hover:bg-muted/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 ${getTypeColor(insight.type)}`}>{getIcon(insight.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-sm font-medium">{insight.title}</h3>
                  {insight.value && <span className="text-xs font-mono text-primary font-bold">{insight.value}</span>}
                </div>
                <p className="text-xs text-muted-foreground mb-1">{insight.description}</p>
                <div className="text-xs text-muted-foreground/60">{formatTimestamp(insight.timestamp)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

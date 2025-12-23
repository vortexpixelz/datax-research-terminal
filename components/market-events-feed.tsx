"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, TrendingUp, Newspaper } from "lucide-react"

export interface MarketEvent {
  id: string
  type: "trade" | "price_alert" | "volume_spike" | "news"
  symbol: string
  title: string
  description: string
  timestamp: number
  severity: "low" | "medium" | "high"
  data?: any
}

export function MarketEventsFeed() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [typeFilter, setTypeFilter] = useState<MarketEvent["type"] | "all">("all")
  const [severityFilter, setSeverityFilter] = useState<MarketEvent["severity"] | "all">(
    "all",
  )

  useEffect(() => {
    const mockEvents: MarketEvent[] = [
      {
        id: "1",
        type: "price_alert",
        symbol: "AAPL",
        title: "AAPL surged 3.2%",
        description: "Price moved from $182.50 to $188.34",
        timestamp: Date.now() - 120000,
        severity: "high",
      },
      {
        id: "2",
        type: "volume_spike",
        symbol: "TSLA",
        title: "TSLA volume spike detected",
        description: "Volume increased 250% above average",
        timestamp: Date.now() - 300000,
        severity: "medium",
      },
      {
        id: "3",
        type: "news",
        symbol: "NVDA",
        title: "NVDA announces new AI chip",
        description: "Company unveils next-generation GPU architecture",
        timestamp: Date.now() - 600000,
        severity: "high",
      },
    ]

    setEvents(mockEvents)
  }, [])

  const getIcon = (type: MarketEvent["type"]) => {
    switch (type) {
      case "price_alert":
        return <TrendingUp className="h-3.5 w-3.5" />
      case "volume_spike":
        return <AlertTriangle className="h-3.5 w-3.5" />
      case "news":
        return <Newspaper className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: MarketEvent["severity"]) => {
    switch (severity) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-primary"
      case "low":
        return "text-muted-foreground"
    }
  }

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const filteredEvents = events.filter((event) => {
    const matchesType = typeFilter === "all" || event.type === typeFilter
    const matchesSeverity =
      severityFilter === "all" || event.severity === severityFilter

    return matchesType && matchesSeverity
  })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-primary uppercase tracking-wider">MARKET EVENTS</h3>
        <div className="text-xs text-muted-foreground">LIVE</div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="event-type-filter" className="text-xs font-medium text-muted-foreground">
            Filter by event type
          </label>
          <select
            id="event-type-filter"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as MarketEvent["type"] | "all")}
            className="h-8 rounded border bg-background px-2 text-xs"
          >
            <option value="all">All types</option>
            <option value="price_alert">Price alerts</option>
            <option value="volume_spike">Volume spikes</option>
            <option value="news">News</option>
            <option value="trade">Trades</option>
          </select>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="event-severity-filter"
            className="text-xs font-medium text-muted-foreground"
          >
            Filter by severity
          </label>
          <select
            id="event-severity-filter"
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value as MarketEvent["severity"] | "all")
            }
            className="h-8 rounded border bg-background px-2 text-xs"
          >
            <option value="all">All severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground bg-card border">NO EVENTS</div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="bg-card border p-2.5 hover:bg-sidebar-accent transition-colors">
              <div className="flex items-start gap-2">
                <div className={getSeverityColor(event.severity)}>{getIcon(event.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xs font-bold text-primary">{event.symbol}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(event.timestamp)}</span>
                  </div>
                  <div className="text-xs font-medium mt-0.5">{event.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{event.description}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

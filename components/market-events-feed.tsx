"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, TrendingUp, Newspaper } from "lucide-react"

import { Button } from "@/components/ui/button"

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

const mockEventPages: MarketEvent[][] = [
  [
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
  ],
  [
    {
      id: "4",
      type: "price_alert",
      symbol: "MSFT",
      title: "MSFT breaks resistance",
      description: "Price moved above $420 for the first time this month",
      timestamp: Date.now() - 900000,
      severity: "medium",
    },
    {
      id: "5",
      type: "volume_spike",
      symbol: "AMZN",
      title: "AMZN block trade detected",
      description: "Large institutional order spotted in after-hours trading",
      timestamp: Date.now() - 1200000,
      severity: "high",
    },
  ],
  [
    {
      id: "6",
      type: "news",
      symbol: "META",
      title: "META expands AI research",
      description: "Company announces new partnership with leading AI lab",
      timestamp: Date.now() - 1500000,
      severity: "medium",
    },
    {
      id: "7",
      type: "trade",
      symbol: "GOOGL",
      title: "GOOGL unusual options activity",
      description: "Call volume 3x daily average with bullish skew",
      timestamp: Date.now() - 1800000,
      severity: "low",
    },
  ],
]

const fetchMockEvents = async (page: number) => {
  const events = mockEventPages[page] ?? []
  const hasMore = page + 1 < mockEventPages.length

  return new Promise<{ events: MarketEvent[]; hasMore: boolean }>((resolve) => {
    setTimeout(() => {
      resolve({ events, hasMore })
    }, 600)
  })
}

export function MarketEventsFeed() {
  const [events, setEvents] = useState<MarketEvent[]>([])
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchInitial = async () => {
      setIsLoading(true)

      try {
        const { events: newEvents, hasMore: moreAvailable } = await fetchMockEvents(0)

        if (cancelled) return

        if (newEvents.length === 0) {
          setHasMore(false)
          return
        }

        setEvents(newEvents)
        setHasMore(moreAvailable)
        setPage(1)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchInitial()

    return () => {
      cancelled = true
    }
  }, [])

  const loadEvents = async (pageToFetch: number) => {
    if (isLoading || !hasMore) return

    setIsLoading(true)

    try {
      const { events: newEvents, hasMore: moreAvailable } = await fetchMockEvents(pageToFetch)

      if (newEvents.length === 0) {
        setHasMore(false)
        return
      }

      setEvents((prev) => [...prev, ...newEvents])
      setHasMore(moreAvailable)
      setPage(pageToFetch + 1)
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-primary uppercase tracking-wider">MARKET EVENTS</h3>
        <div className="text-xs text-muted-foreground">LIVE</div>
      </div>

      <div className="space-y-1 max-h-96 overflow-y-auto">
        {events.length === 0 && isLoading ? (
          <div className="p-3 text-xs text-muted-foreground bg-card border">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="p-3 text-xs text-muted-foreground bg-card border">NO EVENTS</div>
        ) : (
          <>
            {events.map((event) => (
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
            ))}
            {isLoading && (
              <div className="p-3 text-xs text-muted-foreground bg-card border">Loading events...</div>
            )}
            {!hasMore && !isLoading && (
              <div className="p-3 text-xs text-muted-foreground bg-card border text-center">
                You're all caught up
              </div>
            )}
          </>
        )}
      </div>

      <div className="pt-2">
        <Button onClick={() => loadEvents(page)} disabled={isLoading || !hasMore} className="w-full">
          {isLoading ? "Loading..." : hasMore ? "Load more events" : "No more events"}
        </Button>
      </div>
    </div>
  )
}

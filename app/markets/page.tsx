"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StockChart } from "@/components/stock-chart"
import { MarketIndices } from "@/components/market-indices"
import { TopMovers } from "@/components/top-movers"
import { KalshiMarkets } from "@/components/kalshi-markets"
import { MarketInsights } from "@/components/market-insights"
import { useRealtimeTicker } from "@/hooks/use-realtime-ticker"
import { X } from "lucide-react"

export default function MarketsPage() {
  const [selectedTicker, setSelectedTicker] = useState("AAPL")
  const [tickerInput, setTickerInput] = useState("")
  const [pinnedInput, setPinnedInput] = useState("")
  const [pinnedTickers, setPinnedTickers] = useState<string[]>([])
  const [pinsHydrated, setPinsHydrated] = useState(false)
  const { updates, connected } = useRealtimeTicker(pinnedTickers)
  const hasPinnedTickers = pinnedTickers.length > 0
  const statusLabel = hasPinnedTickers ? (connected ? "LIVE" : "OFFLINE") : "IDLE"
  const statusClass = hasPinnedTickers && connected ? "text-success" : "text-muted-foreground"

  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = window.localStorage.getItem("pinnedTickers")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setPinnedTickers(parsed)
          setPinsHydrated(true)
          return
        }
      } catch (error) {
        console.error("Failed to parse pinnedTickers from localStorage", error)
      }
    }

    setPinnedTickers(["AAPL"])
    setPinsHydrated(true)
  }, [])

  useEffect(() => {
    if (!pinsHydrated || typeof window === "undefined") return
    window.localStorage.setItem("pinnedTickers", JSON.stringify(pinnedTickers))
  }, [pinnedTickers, pinsHydrated])

  const handleSearchTicker = (e: React.FormEvent) => {
    e.preventDefault()
    if (tickerInput.trim()) {
      setSelectedTicker(tickerInput.toUpperCase())
      setTickerInput("")
    }
  }

  const handleAddPinnedTicker = (e: React.FormEvent) => {
    e.preventDefault()
    const ticker = pinnedInput.trim().toUpperCase()
    if (!ticker) return

    setPinnedTickers((prev) => {
      if (prev.includes(ticker)) {
        return prev
      }
      return [...prev, ticker]
    })
    setPinnedInput("")
    setSelectedTicker(ticker)
  }

  const handleRemovePinnedTicker = (ticker: string) => {
    setPinnedTickers((prev) => {
      const next = prev.filter((item) => item !== ticker)
      if (ticker === selectedTicker && next.length > 0) {
        setSelectedTicker(next[0])
      }
      return next
    })
  }

  return (
    <div className="flex h-screen">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="container max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-sm font-bold text-primary uppercase tracking-wider">MARKET OVERVIEW</h1>
              <div className="text-xs text-muted-foreground">Real-time Data Feed</div>
            </div>
            <form onSubmit={handleSearchTicker} className="flex gap-2">
              <Input
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="TICKER SYMBOL"
                className="w-32 h-8 text-xs uppercase bg-background"
              />
              <Button type="submit" size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90">
                LOAD
              </Button>
            </form>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto p-4 space-y-4">
          <div className="bg-card border p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider">Pinned Tickers</h2>
                <span className={`text-[10px] font-semibold tracking-widest ${statusClass}`}>{statusLabel}</span>
              </div>
              <form onSubmit={handleAddPinnedTicker} className="flex gap-2">
                <Input
                  value={pinnedInput}
                  onChange={(e) => setPinnedInput(e.target.value)}
                  placeholder="ADD TICKER"
                  className="w-32 h-8 text-xs uppercase bg-background"
                />
                <Button type="submit" size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90">
                  PIN
                </Button>
              </form>
            </div>

            {!pinsHydrated ? (
              <div className="text-xs text-muted-foreground">Loading pinned tickers…</div>
            ) : pinnedTickers.length === 0 ? (
              <div className="text-xs text-muted-foreground">No tickers pinned yet. Add symbols to watch them here.</div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {pinnedTickers.map((ticker) => {
                  const update = updates.get(ticker)
                  const priceText =
                    typeof update?.price === "number" ? `$${update.price.toFixed(2)}` : connected ? "Waiting…" : "—"
                  const change = update?.change ?? 0
                  const changePercent = update?.changePercent ?? 0
                  const hasUpdate = typeof update !== "undefined"
                  const changeColor = hasUpdate
                    ? change > 0
                      ? "text-success"
                      : change < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                    : "text-muted-foreground"
                  const changeSign = change > 0 ? "+" : ""
                  const percentSign = changePercent > 0 ? "+" : ""
                  const changeText = hasUpdate
                    ? `${changeSign}${change.toFixed(2)} (${percentSign}${changePercent.toFixed(2)}%)`
                    : connected
                      ? "Awaiting data"
                      : "Data unavailable"

                  return (
                    <div key={ticker} className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedTicker(ticker)}
                        className="border bg-muted/40 hover:bg-muted/70 transition-colors rounded-md px-3 py-2 text-left min-w-[160px] pr-8"
                      >
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold tracking-wider">{ticker}</span>
                          <span className="text-sm font-mono">{priceText}</span>
                        </div>
                        <div className={`text-[11px] font-medium ${changeColor}`}>{changeText}</div>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleRemovePinnedTicker(ticker)
                        }}
                        className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${ticker} from pinned tickers`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <MarketInsights />
            </div>
            <MarketIndices />
          </div>

          <KalshiMarkets />

          <div className="bg-card border">
            <div className="border-b px-4 py-2 bg-muted">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-primary uppercase tracking-wider">{selectedTicker} - CHART</h2>
                <div className="text-xs text-muted-foreground">1D | 5D | 1M | 3M | 1Y | 5Y</div>
              </div>
            </div>
            <div className="p-4">
              <StockChart ticker={selectedTicker} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <TopMovers type="gainers" />
            <TopMovers type="losers" />
          </div>
        </div>
      </div>

      {/* Right Sidebar Navigation */}
      <aside className="w-56 border-l bg-sidebar flex flex-col">
        <div className="p-4 border-b">
          <div className="text-primary font-bold text-sm tracking-wider">DATAX</div>
          <div className="text-xs text-muted-foreground mt-0.5">TERMINAL v1.0</div>
        </div>

        <nav className="flex flex-col p-2 gap-1">
          <Link
            href="/"
            className="px-3 py-2 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            AI Chat
          </Link>
          <Link
            href="/notes"
            className="px-3 py-2 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Notes
          </Link>
          <Link
            href="/portfolio"
            className="px-3 py-2 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Portfolio
          </Link>
          <Link
            href="/screener"
            className="px-3 py-2 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Screener
          </Link>
          <Link
            href="/markets"
            className="px-3 py-2 text-xs font-medium uppercase tracking-wider bg-primary text-primary-foreground"
          >
            Markets
          </Link>
        </nav>

        <div className="mt-auto p-3 border-t space-y-2">
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-success">ONLINE</span>
            </div>
            <div className="flex justify-between">
              <span>API:</span>
              <span className="text-primary">CONNECTED</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

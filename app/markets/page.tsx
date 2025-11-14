"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StockChart } from "@/components/stock-chart"
import { MarketIndices } from "@/components/market-indices"
import { TopMovers } from "@/components/top-movers"
import { KalshiMarkets } from "@/components/kalshi-markets"
import { MarketInsights } from "@/components/market-insights"
import { MarketNews } from "@/components/market-news"

export default function MarketsPage() {
  const [selectedTicker, setSelectedTicker] = useState("AAPL")
  const [tickerInput, setTickerInput] = useState("")

  const handleSearchTicker = (e: React.FormEvent) => {
    e.preventDefault()
    if (tickerInput.trim()) {
      setSelectedTicker(tickerInput.toUpperCase())
      setTickerInput("")
    }
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
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <MarketInsights />
              <MarketNews />
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

"use client"

import { useState } from "react"
import Link from "next/link"
import Script from "next/script"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortfolioHoldings } from "@/components/portfolio-holdings"
import { PortfolioStats } from "@/components/portfolio-stats"
import { AllocationChart } from "@/components/allocation-chart"
import { Watchlist } from "@/components/watchlist"
import { AddHoldingDialog } from "@/components/add-holding-dialog"
import { AddWatchlistDialog } from "@/components/add-watchlist-dialog"
import { getCanonicalUrl } from "@/lib/metadata"

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Portfolio Tracker",
  description:
    "Track holdings, monitor allocation, and manage custom watchlists in the Datax Terminal portfolio workspace.",
  url: getCanonicalUrl("/portfolio"),
  applicationCategory: "FinanceApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  potentialAction: {
    "@type": "OrganizeAction",
    target: getCanonicalUrl("/portfolio"),
    description: "Add or update portfolio holdings to analyze performance.",
  },
}

export type Holding = {
  id: string
  ticker: string
  name: string
  shares: number
  avgCost: number
  currentPrice: number
  sector: string
}

export type WatchlistItem = {
  id: string
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>([
    {
      id: "1",
      ticker: "AAPL",
      name: "Apple Inc",
      shares: 50,
      avgCost: 150,
      currentPrice: 175,
      sector: "Technology",
    },
    {
      id: "2",
      ticker: "MSFT",
      name: "Microsoft Corp",
      shares: 30,
      avgCost: 300,
      currentPrice: 380,
      sector: "Technology",
    },
    {
      id: "3",
      ticker: "JPM",
      name: "JPMorgan Chase",
      shares: 25,
      avgCost: 140,
      currentPrice: 155,
      sector: "Financials",
    },
  ])

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    { id: "1", ticker: "NVDA", name: "NVIDIA Corp", price: 875.5, change: 45.2, changePercent: 5.44 },
    { id: "2", ticker: "TSLA", name: "Tesla Inc", price: 245.3, change: 12.8, changePercent: 5.51 },
    { id: "3", ticker: "AMD", name: "AMD Inc", price: 165.8, change: 8.9, changePercent: 5.67 },
  ])

  const [showAddHolding, setShowAddHolding] = useState(false)
  const [showAddWatchlist, setShowAddWatchlist] = useState(false)

  const handleAddHolding = (holding: Omit<Holding, "id">) => {
    setHoldings((prev) => [...prev, { ...holding, id: Date.now().toString() }])
    setShowAddHolding(false)
  }

  const handleRemoveHolding = (id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id))
  }

  const handleAddWatchlist = (item: Omit<WatchlistItem, "id" | "price" | "change" | "changePercent">) => {
    const newItem: WatchlistItem = {
      ...item,
      id: Date.now().toString(),
      price: 0,
      change: 0,
      changePercent: 0,
    }
    setWatchlist((prev) => [...prev, newItem])
    setShowAddWatchlist(false)
  }

  const handleRemoveWatchlist = (id: string) => {
    setWatchlist((prev) => prev.filter((w) => w.id !== id))
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.avgCost, 0)
  const totalGain = totalValue - totalCost
  const totalGainPercent = (totalGain / totalCost) * 100

  return (
    <div className="flex h-screen">
      <Script id="portfolio-ld-json" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(structuredData)}
      </Script>
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold">Portfolio</h1>
          </div>

          <PortfolioStats
            totalValue={totalValue}
            totalCost={totalCost}
            totalGain={totalGain}
            totalGainPercent={totalGainPercent}
          />

          <Tabs defaultValue="holdings" className="w-full">
            <TabsList>
              <TabsTrigger value="holdings">Holdings</TabsTrigger>
              <TabsTrigger value="allocation">Allocation</TabsTrigger>
              <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            </TabsList>

            <TabsContent value="holdings" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddHolding(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Holding
                </Button>
              </div>
              <PortfolioHoldings holdings={holdings} onRemove={handleRemoveHolding} />
            </TabsContent>

            <TabsContent value="allocation">
              <AllocationChart holdings={holdings} />
            </TabsContent>

            <TabsContent value="watchlist" className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowAddWatchlist(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Watchlist
                </Button>
              </div>
              <Watchlist items={watchlist} onRemove={handleRemoveWatchlist} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right Sidebar Navigation */}
      <aside className="w-64 border-l bg-background p-6 flex flex-col gap-6">
        <div className="font-bold text-lg">Datax Market Research</div>

        <nav className="flex flex-col gap-2">
          <Link href="/" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            AI Chat
          </Link>
          <Link href="/notes" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            Notes
          </Link>
          <Link href="/portfolio" className="px-3 py-2 text-sm font-medium rounded bg-muted">
            Portfolio
          </Link>
          <Link href="/screener" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            Screener
          </Link>
          <Link href="/markets" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            Markets
          </Link>
        </nav>

        <div className="mt-auto space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            Sign In
          </Button>
          <Button className="w-full">Get Started</Button>
        </div>
      </aside>

      <AddHoldingDialog open={showAddHolding} onOpenChange={setShowAddHolding} onAdd={handleAddHolding} />
      <AddWatchlistDialog open={showAddWatchlist} onOpenChange={setShowAddWatchlist} onAdd={handleAddWatchlist} />
    </div>
  )
}

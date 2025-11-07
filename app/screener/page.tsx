"use client"

import { useState, useMemo } from "react"
import { Search, Save, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScreenerFilters } from "@/components/screener-filters"
import { ScreenerResults } from "@/components/screener-results"

export type ScreenCriteria = {
  marketCapMin?: number
  marketCapMax?: number
  peMin?: number
  peMax?: number
  priceMin?: number
  priceMax?: number
  volumeMin?: number
  sector?: string
  changePercentMin?: number
  changePercentMax?: number
}

export type StockResult = {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  pe: number
  volume: number
  sector: string
}

export default function ScreenerPage() {
  const [criteria, setCriteria] = useState<ScreenCriteria>({})
  const [searchQuery, setSearchQuery] = useState("")

  const allStocks: StockResult[] = [
    {
      ticker: "AAPL",
      name: "Apple Inc",
      price: 175.5,
      change: 2.3,
      changePercent: 1.33,
      marketCap: 2800000000000,
      pe: 28.5,
      volume: 52000000,
      sector: "Technology",
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corp",
      price: 380.2,
      change: 5.8,
      changePercent: 1.55,
      marketCap: 2900000000000,
      pe: 32.1,
      volume: 28000000,
      sector: "Technology",
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corp",
      price: 875.5,
      change: 45.2,
      changePercent: 5.44,
      marketCap: 2200000000000,
      pe: 65.3,
      volume: 42000000,
      sector: "Technology",
    },
    {
      ticker: "TSLA",
      name: "Tesla Inc",
      price: 245.3,
      change: 12.8,
      changePercent: 5.51,
      marketCap: 780000000000,
      pe: 58.2,
      volume: 125000000,
      sector: "Consumer",
    },
    {
      ticker: "JPM",
      name: "JPMorgan Chase",
      price: 155.8,
      change: 1.2,
      changePercent: 0.78,
      marketCap: 450000000000,
      pe: 11.2,
      volume: 12000000,
      sector: "Financials",
    },
    {
      ticker: "V",
      name: "Visa Inc",
      price: 265.9,
      change: 3.5,
      changePercent: 1.33,
      marketCap: 560000000000,
      pe: 29.8,
      volume: 8000000,
      sector: "Financials",
    },
    {
      ticker: "JNJ",
      name: "Johnson & Johnson",
      price: 158.4,
      change: 0.8,
      changePercent: 0.51,
      marketCap: 420000000000,
      pe: 15.7,
      volume: 6500000,
      sector: "Healthcare",
    },
    {
      ticker: "UNH",
      name: "UnitedHealth Group",
      price: 525.3,
      change: 4.2,
      changePercent: 0.81,
      marketCap: 490000000000,
      pe: 22.4,
      volume: 3200000,
      sector: "Healthcare",
    },
    {
      ticker: "XOM",
      name: "Exxon Mobil",
      price: 112.5,
      change: -1.3,
      changePercent: -1.14,
      marketCap: 460000000000,
      pe: 9.8,
      volume: 18000000,
      sector: "Energy",
    },
    {
      ticker: "CVX",
      name: "Chevron Corp",
      price: 158.9,
      change: -0.7,
      changePercent: -0.44,
      marketCap: 290000000000,
      pe: 10.5,
      volume: 7500000,
      sector: "Energy",
    },
  ]

  const filteredStocks = useMemo(() => {
    return allStocks.filter((stock) => {
      if (criteria.marketCapMin && stock.marketCap < criteria.marketCapMin) return false
      if (criteria.marketCapMax && stock.marketCap > criteria.marketCapMax) return false
      if (criteria.peMin && stock.pe < criteria.peMin) return false
      if (criteria.peMax && stock.pe > criteria.peMax) return false
      if (criteria.priceMin && stock.price < criteria.priceMin) return false
      if (criteria.priceMax && stock.price > criteria.priceMax) return false
      if (criteria.volumeMin && stock.volume < criteria.volumeMin) return false
      if (criteria.sector && stock.sector !== criteria.sector) return false
      if (criteria.changePercentMin && stock.changePercent < criteria.changePercentMin) return false
      if (criteria.changePercentMax && stock.changePercent > criteria.changePercentMax) return false

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return stock.ticker.toLowerCase().includes(query) || stock.name.toLowerCase().includes(query)
      }

      return true
    })
  }, [criteria, searchQuery])

  const handleReset = () => {
    setCriteria({})
    setSearchQuery("")
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Filters */}
      <aside className="w-80 border-r bg-background overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Stock Screener</h2>
            <p className="text-sm text-muted-foreground">Filter stocks by fundamental and technical criteria</p>
          </div>

          <div>
            <Label>Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ticker or company name"
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScreenerFilters criteria={criteria} onCriteriaChange={setCriteria} />

          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
              Reset
            </Button>
            <Button variant="outline" size="icon">
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Results</h1>
              <p className="text-muted-foreground mt-1">{filteredStocks.length} stocks match your criteria</p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          <ScreenerResults stocks={filteredStocks} />
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
          <Link href="/portfolio" className="px-3 py-2 text-sm font-medium rounded hover:bg-muted transition-colors">
            Portfolio
          </Link>
          <Link href="/screener" className="px-3 py-2 text-sm font-medium rounded bg-muted">
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
    </div>
  )
}

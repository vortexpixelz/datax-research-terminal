"use client"

import { useState, useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useTickerSearch } from "@/hooks/use-ticker-search"

interface TickerSearchProps {
  onSelectTicker?: (symbol: string) => void
}

export function TickerSearch({ onSelectTicker }: TickerSearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { results, loading } = useTickerSearch(query)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (symbol: string) => {
    setQuery("")
    setIsOpen(false)
    onSelectTicker?.(symbol)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="SEARCH TICKER: AAPL, TSLA, BTC..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 uppercase text-sm bg-background font-mono"
        />
      </div>

      {isOpen && query && (
        <div className="absolute top-full mt-1 w-full bg-card border shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-xs text-muted-foreground">SEARCHING...</div>
          ) : results.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">NO RESULTS FOUND</div>
          ) : (
            <div>
              {results.map((result) => (
                <button
                  key={result.symbol}
                  onClick={() => handleSelect(result.symbol)}
                  className="w-full p-2.5 hover:bg-sidebar-accent transition-colors text-left border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-primary">{result.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate">{result.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{result.exchange}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

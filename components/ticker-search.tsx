"use client"

import { useState, useRef, useEffect, useId } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTickerSearch } from "@/hooks/use-ticker-search"

interface TickerSearchProps {
  onSelectTicker?: (symbol: string) => void
}

export function TickerSearch({ onSelectTicker }: TickerSearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const { results, loading } = useTickerSearch(query)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputId = useId()
  const listboxId = `${inputId}-listbox`

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
        <Label htmlFor={inputId} className="sr-only">
          Search for a ticker symbol
        </Label>
        <Search aria-hidden="true" className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id={inputId}
          type="text"
          placeholder="SEARCH TICKER: AAPL, TSLA, BTC..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          aria-expanded={isOpen && Boolean(query)}
          aria-controls={listboxId}
          role="combobox"
          aria-autocomplete="list"
          className="pl-9 uppercase text-sm bg-background font-mono"
        />
      </div>

      {isOpen && query && (
        <div
          className="absolute top-full mt-1 w-full bg-card border shadow-lg z-50 max-h-96 overflow-y-auto"
          role="presentation"
        >
          {loading ? (
            <div className="p-3 text-xs text-muted-foreground" role="status" aria-live="polite">
              SEARCHING...
            </div>
          ) : results.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground" role="status" aria-live="polite">
              NO RESULTS FOUND
            </div>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Ticker search suggestions">
              {results.map((result) => (
                <li key={result.symbol}>
                  <button
                    type="button"
                    role="option"
                    aria-selected="false"
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
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

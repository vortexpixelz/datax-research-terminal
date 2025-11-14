"use client"

import { useEffect, useState } from "react"

import type { MarketNewsItem } from "@/lib/api/polygon"

export function MarketNews() {
  const [articles, setArticles] = useState<MarketNewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/market/news?limit=8")

        if (!response.ok) {
          throw new Error("Failed to fetch market news")
        }

        const data = (await response.json()) as MarketNewsItem[]
        setArticles(data)
      } catch (err) {
        console.error("[v0] Failed to load market news", err)
        setError(err instanceof Error ? err.message : "Unable to load market news")
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) {
      return ""
    }
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="bg-card border">
      <div className="border-b px-4 py-2 bg-muted">
        <h2 className="text-xs font-bold text-primary uppercase tracking-wider">MARKET NEWS</h2>
      </div>

      {loading ? (
        <div className="p-4 text-xs text-muted-foreground">Loading market news...</div>
      ) : error ? (
        <div className="p-4 text-xs text-destructive">{error}</div>
      ) : articles.length === 0 ? (
        <div className="p-4 text-xs text-muted-foreground">No market news available.</div>
      ) : (
        <div className="divide-y max-h-96 overflow-y-auto">
          {articles.map((article) => {
            const summaryText = article.summary.trim() ? article.summary : "No summary available."

            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-medium">{article.title}</h3>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80 whitespace-nowrap">
                        {article.source}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{summaryText}</p>
                    <div className="text-[10px] text-muted-foreground/60 mt-2">
                      {formatTimestamp(article.publishedAt)}
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}

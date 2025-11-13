"use client"

import type React from "react"
import { TickerSearch } from "@/components/ticker-search"
import { MarketEventsFeed } from "@/components/market-events-feed"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useState } from "react"

const HIGHLIGHT_THRESHOLD = 1000
const HARD_LIMIT = 1500

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      headers: () => {
        const apiKey = typeof window !== "undefined" ? localStorage.getItem("groq_api_key") : null
        return apiKey ? { "x-groq-api-key": apiKey } : {}
      },
    }),
  })

  const [input, setInput] = useState("")

  const inputLength = input.length
  const isOverThreshold = inputLength > HIGHLIGHT_THRESHOLD
  const isAtOrOverLimit = inputLength >= HARD_LIMIT
  const counterColorClass = isAtOrOverLimit
    ? "text-destructive"
    : isOverThreshold
      ? "text-amber-500"
      : "text-muted-foreground"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || status === "in_progress" || isAtOrOverLimit) return

    sendMessage({ text: input })
    setInput("")
  }

  return (
    <div className="flex h-screen">
      {/* Main Chat Area - Center */}
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-card p-2.5">
          <TickerSearch
            onSelectTicker={(symbol) => {
              sendMessage({ text: `Tell me about ${symbol}` })
            }}
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="space-y-6 max-w-3xl px-6">
                <div className="border-l-2 border-primary pl-4">
                  <h1 className="text-xl font-bold text-primary mb-1">DATAX RESEARCH TERMINAL</h1>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Real-time market intelligence & analysis
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border p-4 space-y-2">
                    <div className="text-xs text-primary uppercase tracking-wider">Market Queries</div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>&gt; What is the P/E ratio of AAPL?</div>
                      <div>&gt; Show me NVDA fundamentals</div>
                      <div>&gt; Compare MSFT vs GOOGL revenue</div>
                    </div>
                  </div>
                  <div className="bg-card border p-4 space-y-2">
                    <div className="text-xs text-primary uppercase tracking-wider">Technical Analysis</div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>&gt; Is TSLA overbought?</div>
                      <div>&gt; Show me momentum stocks</div>
                      <div>&gt; What are the support levels for SPY?</div>
                    </div>
                  </div>
                  <div className="bg-card border p-4 space-y-2">
                    <div className="text-xs text-primary uppercase tracking-wider">Sector Analysis</div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>&gt; Top performing sectors today</div>
                      <div>&gt; Tech sector outlook</div>
                      <div>&gt; Energy stocks under $50</div>
                    </div>
                  </div>
                  <div className="bg-card border p-4 space-y-2">
                    <div className="text-xs text-primary uppercase tracking-wider">Portfolio</div>
                    <div className="text-xs space-y-1 text-muted-foreground">
                      <div>&gt; Analyze my portfolio risk</div>
                      <div>&gt; Diversification recommendations</div>
                      <div>&gt; Compare my holdings to S&P 500</div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted border p-3 text-xs">
                  <span className="text-primary">[SYSTEM]</span> Connected to Polygon.io market data feed • OpenAI GPT-4
                  models • Real-time quotes and fundamentals
                </div>
              </div>
            </div>
          ) : (
            <div className="container max-w-5xl mx-auto p-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="border-l-2 border-primary/30 pl-3 py-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs text-primary uppercase tracking-wide">
                      {message.role === "user" ? "[USER]" : "[AI]"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <p key={index} className="text-sm whitespace-pre-wrap leading-relaxed">
                            {part.text}
                          </p>
                        )
                      }

                      if (part.type.startsWith("tool-")) {
                        const toolName = part.type.replace("tool-", "")
                        if (part.state === "input-available" || part.state === "input-streaming") {
                          return (
                            <div key={index} className="text-xs text-primary/80 mt-1">
                              &gt;&gt; EXECUTING: {toolName.toUpperCase()}
                            </div>
                          )
                        }
                      }

                      return null
                    })}
                  </div>
                </div>
              ))}
              {status === "in_progress" && (
                <div className="border-l-2 border-primary/30 pl-3 py-1">
                  <span className="text-xs text-primary">[AI]</span>
                  <p className="text-sm text-muted-foreground mt-1">Processing request...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-card">
          <div className="container max-w-5xl mx-auto p-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Textarea
                name="message"
                placeholder="ENTER QUERY: Type your market research question..."
                className="min-h-[50px] max-h-[150px] resize-none text-sm bg-background"
                value={input}
                onChange={(event) => {
                  setInput(event.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (isAtOrOverLimit) return
                    const form = e.currentTarget.closest("form")
                    form?.requestSubmit()
                  }
                }}
                disabled={status === "in_progress"}
                maxLength={HARD_LIMIT}
              />
              <Button
                type="submit"
                size="icon"
                className="h-[50px] w-[50px] bg-primary hover:bg-primary/90"
                disabled={status === "in_progress" || isAtOrOverLimit}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex items-center justify-between mt-1 text-xs uppercase tracking-wide">
              <p className="text-muted-foreground">&gt; ENTER to send | SHIFT+ENTER for new line</p>
              <span className={counterColorClass}>
                {inputLength.toLocaleString()} / {HARD_LIMIT.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <aside className="w-44 border-l bg-sidebar flex flex-col">
        <div className="p-3 border-b">
          <div className="text-primary font-bold text-xs tracking-wider">DATAX</div>
          <div className="text-xs text-muted-foreground mt-0.5">TERMINAL</div>
        </div>

        <nav className="flex flex-col p-1.5 gap-0.5">
          <Link
            href="/"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider bg-primary text-primary-foreground"
          >
            AI Chat
          </Link>
          <Link
            href="/notes"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Notes
          </Link>
          <Link
            href="/portfolio"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Portfolio
          </Link>
          <Link
            href="/screener"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Screener
          </Link>
          <Link
            href="/markets"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Markets
          </Link>
          <Link
            href="/settings"
            className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-sidebar-accent transition-colors"
          >
            Settings
          </Link>
        </nav>

        <div className="flex-1 overflow-y-auto p-2.5 border-t">
          <MarketEventsFeed />
        </div>

        <div className="mt-auto p-2.5 border-t space-y-1.5">
          <div className="text-xs text-muted-foreground space-y-0.5">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-success">ONLINE</span>
            </div>
            <div className="flex justify-between">
              <span>API:</span>
              <span className="text-primary">OK</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

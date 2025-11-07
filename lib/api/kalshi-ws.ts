/**
 * Kalshi WebSocket Integration
 * Provides real-time prediction market data streaming
 */

export interface MarketUpdate {
  market_id: string
  market_ticker: string
  title: string
  subtitle?: string
  category: string
  yes_price: number
  no_price: number
  spread: number
  yes_probability: number
  no_probability: number
  volume_24h: number
  open_interest: number
  last_updated: number
}

export interface KalshiWSMessage {
  type: "subscribe" | "unsubscribe" | "update" | "error" | "ping" | "pong"
  markets?: MarketUpdate[]
  market?: MarketUpdate
  error?: string
  timestamp?: number
}

class KalshiWebSocketClient {
  private ws: WebSocket | null = null
  private url: string = "wss://api.kalshi.com/stream"
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private listeners: Map<string, Set<(data: MarketUpdate) => void>> = new Map()
  private subscribedMarkets: Set<string> = new Set()
  private isConnected = false

  /**
   * Connect to Kalshi WebSocket
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log("Kalshi WebSocket connected")
          this.isConnected = true
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: KalshiWSMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error)
          }
        }

        this.ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          this.isConnected = false
          reject(error)
        }

        this.ws.onclose = () => {
          console.log("WebSocket closed")
          this.isConnected = false
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Subscribe to market updates
   */
  subscribe(marketIds: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not connected, queuing subscription")
      this.subscribedMarkets = new Set([
        ...this.subscribedMarkets,
        ...marketIds,
      ])
      return
    }

    const message: KalshiWSMessage = {
      type: "subscribe",
      markets: marketIds.map((id) => ({ market_id: id } as any)),
    }

    this.ws.send(JSON.stringify(message))
    marketIds.forEach((id) => this.subscribedMarkets.add(id))
  }

  /**
   * Unsubscribe from market updates
   */
  unsubscribe(marketIds: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return
    }

    const message: KalshiWSMessage = {
      type: "unsubscribe",
      markets: marketIds.map((id) => ({ market_id: id } as any)),
    }

    this.ws.send(JSON.stringify(message))
    marketIds.forEach((id) => this.subscribedMarkets.delete(id))
  }

  /**
   * Listen for updates on a specific market
   */
  on(
    marketId: string,
    callback: (data: MarketUpdate) => void
  ): () => void {
    if (!this.listeners.has(marketId)) {
      this.listeners.set(marketId, new Set())
    }

    this.listeners.get(marketId)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(marketId)?.delete(callback)
    }
  }

  /**
   * Remove all listeners for a market
   */
  off(marketId: string): void {
    this.listeners.delete(marketId)
  }

  /**
   * Get current subscription status
   */
  getSubscriptions(): string[] {
    return Array.from(this.subscribedMarkets)
  }

  /**
   * Check if connected
   */
  isConnectedStatus(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.isConnected = false
    this.listeners.clear()
    this.subscribedMarkets.clear()
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: KalshiWSMessage): void {
    switch (message.type) {
      case "update":
        if (message.market) {
          this.notifyListeners(message.market.market_id, message.market)
        }
        if (message.markets) {
          message.markets.forEach((market) => {
            this.notifyListeners(market.market_id, market)
          })
        }
        break

      case "ping":
        this.sendPong()
        break

      case "error":
        console.error("Kalshi API error:", message.error)
        break

      default:
        break
    }
  }

  /**
   * Notify listeners of market update
   */
  private notifyListeners(marketId: string, data: MarketUpdate): void {
    const callbacks = this.listeners.get(marketId)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data)
        } catch (error) {
          console.error("Error in listener callback:", error)
        }
      })
    }
  }

  /**
   * Send pong response
   */
  private sendPong(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: "pong" }))
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    console.log(`Attempting to reconnect in ${delay}ms...`)

    setTimeout(() => {
      this.connect()
        .then(() => {
          // Re-subscribe to markets
          if (this.subscribedMarkets.size > 0) {
            this.subscribe(Array.from(this.subscribedMarkets))
          }
        })
        .catch((error) => {
          console.error("Reconnection failed:", error)
          this.attemptReconnect()
        })
    }, delay)
  }
}

// Singleton instance
let instance: KalshiWebSocketClient | null = null

/**
 * Get or create Kalshi WebSocket client instance
 */
export function getKalshiClient(): KalshiWebSocketClient {
  if (!instance) {
    instance = new KalshiWebSocketClient()
  }
  return instance
}

/**
 * Utility function to fetch market data (fallback if WebSocket not available)
 */
export async function fetchKalshiMarkets(category?: string): Promise<MarketUpdate[]> {
  try {
    const url = new URL("https://api.kalshi.com/v2/markets")

    if (category) {
      url.searchParams.set("category", category)
    }

    // Limit to active markets
    url.searchParams.set("status", "active")

    const response = await fetch(url.toString(), {
      headers: {
        "Accept": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.markets || []
  } catch (error) {
    console.error("Failed to fetch Kalshi markets:", error)
    return []
  }
}

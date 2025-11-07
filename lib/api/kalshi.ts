// Kalshi WebSocket client for real-time prediction market data
// Documentation: https://docs.kalshi.com/getting_started/quick_start_websockets

export interface KalshiMarket {
  ticker: string
  title: string
  category: string
  yes_price: number
  no_price: number
  volume: number
  open_interest: number
  close_date: string
  status: "active" | "closed" | "settled"
}

export interface KalshiTrade {
  ticker: string
  side: "yes" | "no"
  price: number
  count: number
  timestamp: number
}

// For demo purposes, we'll use REST API to get market data
// In production, you'd use WebSocket with proper authentication
export async function getKalshiMarkets(): Promise<KalshiMarket[]> {
  try {
    // Mock data for demonstration - in production, fetch from Kalshi API
    return [
      {
        ticker: "FED-23DEC-T5.50",
        title: "Will the Fed rate be above 5.5% in Dec 2023?",
        category: "Economics",
        yes_price: 0.72,
        no_price: 0.28,
        volume: 125430,
        open_interest: 45230,
        close_date: "2023-12-31",
        status: "active",
      },
      {
        ticker: "INFL-23NOV-T3.5",
        title: "Will CPI inflation be above 3.5% in Nov?",
        category: "Economics",
        yes_price: 0.58,
        no_price: 0.42,
        volume: 89560,
        open_interest: 32100,
        close_date: "2023-11-30",
        status: "active",
      },
      {
        ticker: "BTCUSD-23DEC-T40K",
        title: "Will Bitcoin be above $40K in December?",
        category: "Crypto",
        yes_price: 0.45,
        no_price: 0.55,
        volume: 234500,
        open_interest: 78900,
        close_date: "2023-12-31",
        status: "active",
      },
      {
        ticker: "UNEMP-23NOV-T4.0",
        title: "Will unemployment be below 4.0% in Nov?",
        category: "Economics",
        yes_price: 0.82,
        no_price: 0.18,
        volume: 67800,
        open_interest: 23400,
        close_date: "2023-11-30",
        status: "active",
      },
      {
        ticker: "SPX-23DEC-T4500",
        title: "Will S&P 500 be above 4500 in December?",
        category: "Markets",
        yes_price: 0.64,
        no_price: 0.36,
        volume: 156700,
        open_interest: 54200,
        close_date: "2023-12-31",
        status: "active",
      },
      {
        ticker: "GDP-23Q4-T2.5",
        title: "Will Q4 GDP growth be above 2.5%?",
        category: "Economics",
        yes_price: 0.51,
        no_price: 0.49,
        volume: 45600,
        open_interest: 18900,
        close_date: "2024-01-31",
        status: "active",
      },
    ]
  } catch (error) {
    console.error("Error fetching Kalshi markets:", error)
    return []
  }
}

export function formatProbability(price: number): string {
  return `${(price * 100).toFixed(1)}%`
}

export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

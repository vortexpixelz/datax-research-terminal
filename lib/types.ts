// Core types for Datax Market Research

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  pe?: number
  high52Week?: number
  low52Week?: number
}

export interface CryptoQuote {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  volume24h: number
  marketCap: number
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  links: string[] // [[WikiLink]] references
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioPosition {
  symbol: string
  assetType: "stock" | "crypto"
  quantity: number
  avgCost: number
  currentPrice?: number
  value?: number
  gainLoss?: number
  gainLossPercent?: number
}

export interface Watchlist {
  id: string
  name: string
  symbols: string[]
  createdAt: Date
}

export interface ScreenerCriteria {
  marketCap?: { min?: number; max?: number }
  pe?: { min?: number; max?: number }
  volume?: { min?: number; max?: number }
  price?: { min?: number; max?: number }
  sector?: string[]
  exchange?: string[]
}
